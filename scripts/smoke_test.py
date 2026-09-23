"""Exercise auth and the queue against the configured fresh DB; remove only this run's records."""
from datetime import datetime, timezone
from pathlib import Path
import secrets
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'app/mr_back'))
from fastapi.testclient import TestClient
from main import create_app
from config import get_settings
from models.VirtualTriage import VTTicket
from security import password_hash


def main():
    suffix = secrets.token_hex(8)
    emails = {role: f'{role}-{suffix}@example.com' for role in ('patient', 'nurse', 'doctor')}
    password = secrets.token_urlsafe(24)
    app = create_app()
    settings = get_settings()
    with TestClient(app, base_url='http://localhost', headers={'Origin': settings.allowed_origins[0]},
                    client=(f'smoke-{suffix}', 50000)) as client:
        db = app.state.db
        try:
            assert client.get('/triage/tickets').status_code == 401
            registration = dict(email=emails['patient'], password=password, name='Fictional Smoke Test',
                dateOfBirth='2000/01/01', gender='Other', streetAddress='Fictional', city='Demo',
                province='BC', country='Canada', postalCode='A1A 1A1', healthNumber='000000000')
            result = client.post('/auth/register', json=registration)
            assert result.status_code == 200, 'Registration failed'
            assert 'password' not in result.json() and 'token' not in result.json()
            patient = db.users.find_one({'email': emails['patient']})
            assert password_hash.verify(password, patient['password_hash'])
            source = dict(ED=1, durationOfSymptoms='One day', listAllergies='None', pastMedicalConditions='None', consent=True)
            for field, definition in VTTicket.model_fields.items():
                if hasattr(definition.annotation, 'model_fields'):
                    source[field] = {key: False for key in definition.annotation.model_fields}
            response = client.post('/triage/tickets', json=source)
            assert response.status_code == 200, 'Triage creation failed'
            ticket = response.json()
            assert ticket['email'] == emails['patient']
            assert client.delete(f"/triage/tickets/{ticket['ticketID']}").status_code == 403
            assert client.post('/auth/logout').status_code == 204
            assert client.get('/auth/user').status_code == 401
            for role, number in [('nurse', 2), ('doctor', 3)]:
                db.users.insert_one({'email': emails[role], 'name': 'Fictional Staff', 'user_type': number,
                                     'inTriage': 'false', 'password_hash': password_hash.hash(password)})
            def login(role):
                result = client.post('/auth/login', json={'email': emails[role], 'password': password})
                assert result.status_code == 200, f'{role} login failed'
            login('nurse')
            result = client.post('/medical/ticket', json={'VTticketID': ticket['ticketID'], 'priority': 2,
                                  'startTime': datetime.now(timezone.utc).isoformat(), 'VTTicket': ticket})
            assert result.status_code == 200, 'Nurse review failed'
            assert client.delete(f"/triage/tickets/{ticket['ticketID']}").status_code == 200
            login('patient')
            assert client.get('/medical/position').json()['position'] is not None
            assert len(client.get('/medical/tickets').json()) == 1
            login('doctor')
            assert client.put('/auth/user', json={'user_email': emails['patient'], 'inTriage': 'doctor'}).status_code == 200
            assert client.delete(f"/medical/tickets/{ticket['ticketID']}").status_code == 200
            login('patient')
            assert client.get('/auth/user').json()['inTriage'] == 'doctor'
            assert client.put('/auth/user', json={'user_email': emails['patient'], 'inTriage': 'false'}).status_code == 200
            assert client.post('/auth/logout', headers={'Origin': 'https://attacker.example'}).status_code == 403
            assert client.post('/auth/logout').status_code == 204
            print('Real MongoDB smoke test passed: registration, login, patient isolation, staff workflow, CSRF and logout.')
        finally:
            addresses = list(emails.values())
            ids = [str(user['_id']) for user in db.users.find({'email': {'$in': addresses}}, {'_id': 1})]
            db.sessions.delete_many({'user_id': {'$in': ids}})
            db.VTTickets.delete_many({'email': {'$in': addresses}})
            db.medicalTickets.delete_many({'VTTicket.email': {'$in': addresses}})
            db.users.delete_many({'email': {'$in': addresses}})


if __name__ == '__main__':
    main()
