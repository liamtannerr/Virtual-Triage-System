"""Verify real MongoDB workflows and rollback; remove only this run's records."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import secrets
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'app/mr_back'))
from fastapi.testclient import TestClient
from pymongo.errors import OperationFailure
from main import create_app
from config import get_settings
from models.VirtualTriage import VTTicket
from security import password_hash


def main():
    suffix = secrets.token_hex(8)
    emails = {role: f'{role}-{suffix}@example.com' for role in ('patient', 'nurse', 'doctor')}
    password = secrets.token_urlsafe(24)
    department_id = secrets.randbits(52)
    app = create_app()
    settings = get_settings()
    with TestClient(app, base_url='http://localhost', headers={'Origin': settings.allowed_origins[0]},
                    client=(f'smoke-{suffix}', 50000)) as client:
        db = app.state.db
        try:
            # A dedicated department keeps real/demo queues and their counts untouched.
            db.emergencyDepartments.insert_one({'establishmentID': department_id,
                'name': 'Temporary Smoke Department', 'address': 'Fictional', 'currentLoad': 0})
            assert client.get('/triage/tickets').status_code == 401
            registration = dict(email=emails['patient'], password=password, name='Fictional Smoke Test',
                dateOfBirth='2000/01/01', gender='Other', streetAddress='Fictional', city='Demo',
                province='BC', country='Canada', postalCode='A1A 1A1', healthNumber='000000000')
            result = client.post('/auth/register', json=registration)
            assert result.status_code == 200, 'Registration failed'
            assert 'password' not in result.json() and 'token' not in result.json()
            patient = db.users.find_one({'email': emails['patient']})
            assert password_hash.verify(password, patient['password_hash'])
            for role, number in [('nurse', 2), ('doctor', 3)]:
                db.users.insert_one({'email': emails[role], 'name': 'Fictional Staff', 'user_type': number,
                                     'inTriage': 'false', 'password_hash': password_hash.hash(password)})

            def login(role):
                response = client.post('/auth/login', json={'email': emails[role], 'password': password})
                assert response.status_code == 200, f'{role} login failed'

            def submit():
                data = dict(ED=department_id, durationOfSymptoms='One day', listAllergies='None',
                            pastMedicalConditions='None', consent=True)
                for field, definition in VTTicket.model_fields.items():
                    if hasattr(definition.annotation, 'model_fields'):
                        data[field] = {key: False for key in definition.annotation.model_fields}
                response = client.post('/triage/tickets', json=data)
                assert response.status_code == 200, 'Triage creation failed'
                assert response.json()['email'] == emails['patient']
                return response.json()['ticketID']

            def snapshot():
                return (
                    list(db.VTTickets.find({'email': emails['patient']})),
                    list(db.medicalTickets.find({'VTTicket.email': emails['patient']})),
                    db.users.find_one({'email': emails['patient']})['inTriage'],
                    db.emergencyDepartments.find_one({'establishmentID': department_id})['currentLoad'],
                )

            def check_rollback(path, collection, method, body=None):
                before = snapshot()
                # Inject a real PyMongo exception after earlier transaction writes.
                original = getattr(type(collection), method)
                def fail(target, *args, **kwargs):
                    if target.full_name == collection.full_name:
                        raise OperationFailure('injected write failure')
                    return original(target, *args, **kwargs)
                # PyMongo returns a fresh Collection object on each db.attribute access.
                with patch.object(type(collection), method, new=fail):
                    response = client.post(path, json=body)
                assert response.status_code == 503, (path, response.status_code)
                assert 'injected' not in response.text
                assert snapshot() == before, f'Partial writes survived rollback: {path}'

            ticket_id = submit()
            approve = f'/triage/tickets/{ticket_id}/approve'
            decline = f'/triage/tickets/{ticket_id}/decline'
            call = f'/medical/tickets/{ticket_id}/call'
            assert client.post(approve, json={'priority': 2}).status_code == 403
            login('nurse')
            check_rollback(approve, db.VTTickets, 'delete_one', {'priority': 2})
            check_rollback(decline, db.users, 'update_one')

            # A business-rule failure also rolls back, not just database exceptions.
            db.users.update_one({'email': emails['patient']}, {'$set': {'inTriage': 'false'}})
            before = snapshot()
            assert client.post(approve, json={'priority': 2}).status_code == 409
            assert snapshot() == before
            db.users.update_one({'email': emails['patient']}, {'$set': {'inTriage': 'true'}})

            # Both requests target the same source; only one may move it/increment load.
            with ThreadPoolExecutor(max_workers=2) as pool:
                results = list(pool.map(lambda _: client.post(approve, json={'priority': 2}).status_code, range(2)))
            assert sorted(results) == [200, 404], results
            triage, medical, state, load = snapshot()
            assert not triage and len(medical) == 1 and state == 'true' and load == 1
            assert medical[0]['VTTicket']['email'] == emails['patient']
            assert client.post(call).status_code == 403

            login('patient')
            assert client.get('/medical/position').json()['position'] is not None
            assert len(client.get('/medical/tickets').json()) == 1
            login('doctor')
            check_rollback(call, db.users, 'update_one')
            assert client.post(call).status_code == 200
            assert snapshot() == ([], [], 'doctor', 0)
            assert client.post(call).status_code == 404
            assert snapshot() == ([], [], 'doctor', 0)
            login('patient')
            assert client.put('/auth/user', json={'user_email': emails['patient'], 'inTriage': 'false'}).status_code == 200

            ticket_id = submit()
            login('nurse')
            decline = f'/triage/tickets/{ticket_id}/decline'
            assert client.post(decline).status_code == 200
            assert snapshot() == ([], [], 'rejected', 0)
            assert client.post(decline).status_code == 404
            login('patient')
            assert client.put('/auth/user', json={'user_email': emails['patient'], 'inTriage': 'false'}).status_code == 200
            assert client.post('/auth/logout', headers={'Origin': 'https://attacker.example'}).status_code == 403
            assert client.post('/auth/logout').status_code == 204
            assert client.get('/auth/user').status_code == 401
            print('Real MongoDB smoke test passed: approve, decline, call, rollback of all three, '
                  'business-rule rollback, simultaneous approval, repeated call, auth and patient acknowledgement.')
        finally:
            addresses = list(emails.values())
            ids = [str(user['_id']) for user in db.users.find({'email': {'$in': addresses}}, {'_id': 1})]
            db.sessions.delete_many({'user_id': {'$in': ids}})
            db.VTTickets.delete_many({'email': {'$in': addresses}})
            db.medicalTickets.delete_many({'VTTicket.email': {'$in': addresses}})
            db.users.delete_many({'email': {'$in': addresses}})
            db.emergencyDepartments.delete_one({'establishmentID': department_id})


if __name__ == '__main__':
    main()
