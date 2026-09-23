from datetime import datetime, timedelta, timezone
import secrets

import pytest
from pydantic import ValidationError
from pymongo.errors import ServerSelectionTimeoutError

from config import Settings
from models.VirtualTriage import VTTicket
from security import password_hash, session_digest

PASSWORD = 'a long unique test password'


def registration(email='alice@example.com'):
    return dict(email=email, password=PASSWORD, name='Alice Example', dateOfBirth='2000/01/01', gender='Other',
                streetAddress='Fictional', city='Demo', province='BC', country='Canada', postalCode='A1A 1A1', healthNumber='000000000')


def sign_in(client, db, role=1, email='alice@example.com'):
    user = dict(email=email, name='Test User', user_type=role, inTriage='false')
    db.users.insert_one(user)
    token = secrets.token_urlsafe(32)
    db.sessions.insert_one({'_id': session_digest(token), 'user_id': str(user['_id']),
                           'expires_at': datetime.now(timezone.utc) + timedelta(minutes=10)})
    client.cookies.set('triage_session', token)
    return user


def ticket():
    data = dict(ticketID=123, email='forged@example.com', patient='Forged Name', ED=1, durationOfSymptoms='One day',
                listAllergies='None', pastMedicalConditions='None', consent=True, timestamp='2026-01-01T00:00:00Z')
    for field, definition in VTTicket.model_fields.items():
        if hasattr(definition.annotation, 'model_fields'):
            data[field] = {key: False for key in definition.annotation.model_fields}
    return data


def test_registration_hashes_password_and_returns_only_safe_fields(client, db):
    response = client.post('/auth/register', json=registration())
    assert response.status_code == 200
    assert set(response.json()) == {'email', 'name', 'user_type', 'inTriage'}
    user = db.users.find_one()
    assert 'password' not in user
    assert user['password_hash'].startswith('$argon2id$')
    assert password_hash.verify(PASSWORD, user['password_hash'])
    cookie = response.headers['set-cookie']
    assert 'HttpOnly' in cookie and 'SameSite=strict' in cookie and 'Max-Age=3600' in cookie
    assert db.sessions.find_one()['_id'] != client.cookies.get('triage_session')
    assert client.get('/auth/user').status_code == 200


@pytest.mark.parametrize('changes', [{'user_type': 2}, {'user_type': 3}, {'inTriage': 'doctor'}, {'password': 'short'}, {'email': {'$ne': None}}, {'disabled': False}])
def test_registration_rejects_privilege_injection_and_invalid_credentials(client, changes):
    data = registration() | changes
    response = client.post('/auth/register', json=data)
    assert response.status_code == 422
    assert PASSWORD not in response.text


def test_login_failure_is_401_and_no_plaintext_legacy_login(client, db):
    db.users.insert_one({'email': 'alice@example.com', 'password': PASSWORD, 'user_type': 1})
    assert client.post('/auth/login', json={'email': 'alice@example.com', 'password': PASSWORD}).status_code == 401
    assert client.post('/auth/login', json={'email': 'missing@example.com', 'password': PASSWORD}).status_code == 401


def test_login_normalization_and_duplicate_account(client):
    assert client.post('/auth/register', json=registration('Alice@Example.com')).status_code == 200
    assert client.post('/auth/register', json=registration()).status_code == 409
    assert client.post('/auth/login', json={'email': 'ALICE@example.com', 'password': PASSWORD}).status_code == 200


def test_logout_revokes_replayed_cookie(client, db):
    sign_in(client, db)
    token = client.cookies.get('triage_session')
    assert client.post('/auth/logout').status_code == 204
    client.cookies.set('triage_session', token)
    assert client.get('/auth/user').status_code == 401


def test_expired_disabled_and_forged_sessions(client, db):
    user = sign_in(client, db)
    db.users.update_one({'_id': user['_id']}, {'$set': {'disabled': True}})
    assert client.get('/auth/user').status_code == 401
    db.users.update_one({'_id': user['_id']}, {'$set': {'disabled': False}})
    db.sessions.update_many({}, {'$set': {'expires_at': datetime.now(timezone.utc) - timedelta(seconds=1)}})
    assert client.get('/auth/user').status_code == 401
    client.cookies.set('triage_session', 'forged')
    assert client.get('/auth/user').status_code == 401


@pytest.mark.parametrize('method,path', [('get', '/auth/user'), ('put', '/auth/user'), ('get', '/triage/tickets'),
    ('post', '/triage/tickets'), ('put', '/triage/tickets/1'), ('delete', '/triage/tickets/1'),
    ('get', '/medical/tickets'), ('get', '/medical/position'), ('post', '/medical/ticket'),
    ('delete', '/medical/tickets/1'), ('put', '/emergency/department/1/currentLoad')])
def test_all_sensitive_endpoints_require_session(client, method, path):
    assert client.request(method, path, json={}).status_code == 401


def test_patient_isolation_and_server_owned_identity(client, db):
    user = sign_in(client, db)
    result = client.post('/triage/tickets', json=ticket())
    assert result.status_code == 200, result.text
    own = result.json()
    assert own['email'] == user['email'] and own['patient'] == user['name'] and own['ticketID'] != 123
    assert own['timestamp'] != ticket()['timestamp']
    other = ticket() | {'ticketID': 789, 'email': 'bob@example.com'}
    db.VTTickets.insert_one(other)
    assert len(client.get('/triage/tickets').json()) == 1
    assert client.post('/triage/tickets', json=ticket()).status_code == 409
    assert client.delete('/triage/tickets/789').status_code == 403
    assert client.put('/triage/tickets/789', json=ticket()).status_code == 403
    assert client.post('/medical/ticket', json={}).status_code == 403
    assert client.put('/auth/user', json={'user_email': 'bob@example.com', 'inTriage': 'doctor'}).status_code == 403
    assert client.put('/emergency/department/1/currentLoad', json={'increment': 1}).status_code == 403


def test_medical_records_filtered_and_queue_position_aggregate(client, db):
    sign_in(client, db)
    for number, email in enumerate(['bob@example.com', 'alice@example.com'], 1):
        db.medicalTickets.insert_one({'VTticketID': number, 'priority': number, 'startTime': '2026-01-01T00:00:00Z',
                                     'VTTicket': ticket() | {'email': email}})
    data = client.get('/medical/tickets').json()
    assert len(data) == 1 and data[0]['VTTicket']['email'] == 'alice@example.com'
    assert client.get('/medical/position').json() == {'position': 2}


def test_staff_permissions_and_authoritative_medical_source(client, db):
    sign_in(client, db, role=2)
    source = ticket() | {'email': 'patient@example.com'}
    db.VTTickets.insert_one(source.copy())
    response = client.post('/medical/ticket', json={'VTticketID': 123, 'priority': 2, 'startTime': '2026-01-01T00:00:00Z', 'VTTicket': ticket()})
    assert response.status_code == 200, response.text
    assert response.json()['VTTicket']['email'] == 'patient@example.com'
    assert client.delete('/medical/tickets/123').status_code == 403
    assert client.put('/emergency/department/1/currentLoad', json={'increment': -1}).status_code == 403
    assert client.delete('/triage/tickets/123').status_code == 200
    client.cookies.clear()
    sign_in(client, db, role=3, email='doctor@example.com')
    assert client.delete('/triage/tickets/123').status_code == 403
    assert client.delete('/medical/tickets/123').status_code == 200


@pytest.mark.parametrize('origin', ['https://attacker.example', 'null', ''])
def test_csrf_blocks_untrusted_or_missing_origin(client, origin):
    assert client.post('/auth/register', headers={'Origin': origin}, json=registration()).status_code == 403
    assert client.post('/auth/logout', headers={'Origin': origin}).status_code == 403


def test_rate_limit_persists_across_requests(client):
    for _ in range(20):
        assert client.post('/auth/login', json={}).status_code == 422
    response = client.post('/auth/login', json={})
    assert response.status_code == 429 and response.headers['retry-after'] == '900'


def test_request_limit_errors_and_headers(client, db, monkeypatch):
    assert client.post('/auth/login', content='x' * 65537).status_code == 413
    assert client.get('/', headers={'Host': 'attacker.example'}).status_code == 400
    response = client.get('/')
    assert response.headers['cache-control'] == 'no-store'
    assert response.headers['x-content-type-options'] == 'nosniff'
    def fail(*args, **kwargs):
        raise ServerSelectionTimeoutError('secret database URI')
    monkeypatch.setattr(db.emergencyDepartments, 'find', fail)
    response = client.get('/emergency/department')
    assert response.status_code == 503 and 'secret' not in response.text


@pytest.mark.parametrize('uri', ['mongodb://127.0.0.1:27017,remote.example:27017', 'mongodb://remote.example', 'mongodb+srv://remote.example/?tls=false',
    'mongodb://localhost/?tlsAllowInvalidCertificates=true', 'mongodb://localhost/?tlsInsecure=true',
    'mongodb://localhost/?tlsAllowInvalidHostnames=true'])
def test_unsafe_mongo_configuration_rejected(uri):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, mongodb_uri=uri)


def test_production_requires_https_and_sets_secure_cookie():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, app_env='production', mongodb_uri='mongodb://localhost')
    settings = Settings(_env_file=None, app_env='production', mongodb_uri='mongodb+srv://fresh.example/',
                        allowed_origins=['https://triage.example'], allowed_hosts=['api.triage.example'])
    assert settings.cookie_name == '__Host-triage_session'


def test_production_cookie_flags_and_expiry(db, monkeypatch):
    from fastapi.testclient import TestClient
    from config import get_settings
    from main import create_app
    monkeypatch.setenv('APP_ENV', 'production')
    monkeypatch.setenv('MONGODB_URI', 'mongodb+srv://fresh.example/')
    monkeypatch.setenv('ALLOWED_ORIGINS', '["https://triage.example"]')
    monkeypatch.setenv('ALLOWED_HOSTS', '["triage.example"]')
    get_settings.cache_clear()
    try:
        app = create_app()
        app.state.db = db
        secure_client = TestClient(app, base_url='https://triage.example', headers={'Origin': 'https://triage.example'})
        response = secure_client.post('/auth/register', json=registration())
        assert response.status_code == 200
        cookie = response.headers['set-cookie']
        assert '__Host-triage_session=' in cookie
        assert 'Secure' in cookie and 'HttpOnly' in cookie and 'Path=/' in cookie and 'Domain=' not in cookie
        assert secure_client.get('/auth/user').status_code == 200
        assert secure_client.get('/docs').status_code == 404
        assert secure_client.get('/').headers['strict-transport-security'] == 'max-age=31536000'
    finally:
        get_settings.cache_clear()


def test_missing_consent_and_unknown_department_rejected(client, db):
    sign_in(client, db)
    assert client.post('/triage/tickets', json=ticket() | {'consent': False}).status_code == 422
    assert client.post('/triage/tickets', json=ticket() | {'ED': 999}).status_code == 422
    assert db.VTTickets.count_documents({}) == 0


def test_patient_cannot_set_staff_status_or_acknowledge_pending_triage(client, db):
    sign_in(client, db)
    for state in ('doctor', 'rejected', 'false'):
        assert client.put('/auth/user', json={'user_email': 'alice@example.com', 'inTriage': state}).status_code == 403
    db.users.update_one({'email': 'alice@example.com'}, {'$set': {'inTriage': 'doctor'}})
    assert client.put('/auth/user', json={'user_email': 'alice@example.com', 'inTriage': 'false'}).status_code == 200


def test_role_changes_take_effect_without_issuing_new_session(client, db):
    user = sign_in(client, db, role=2)
    assert client.delete('/triage/tickets/999').status_code == 404
    db.users.update_one({'_id': user['_id']}, {'$set': {'user_type': 1}})
    assert client.delete('/triage/tickets/999').status_code == 403


def test_cors_allows_only_configured_origin(client):
    headers = {'Origin': 'http://localhost:3000', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type'}
    response = client.options('/auth/login', headers=headers)
    assert response.status_code == 200 and response.headers['access-control-allow-origin'] == 'http://localhost:3000'
    response = client.options('/auth/login', headers=headers | {'Origin': 'https://attacker.example'})
    assert response.status_code == 400 and 'access-control-allow-origin' not in response.headers


def test_invalid_stored_records_do_not_expose_patient_data(client, db):
    sign_in(client, db)
    db.VTTickets.insert_one({'email': 'alice@example.com', 'ticketID': 1, 'patient': 'Private patient information'})
    response = client.get('/triage/tickets')
    assert response.status_code == 500
    assert 'Private patient information' not in response.text
