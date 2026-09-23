"""Local administrator CLI; staff creation is never exposed as a public endpoint."""
import argparse
from getpass import getpass

from pydantic import TypeAdapter, EmailStr
from pymongo.errors import DuplicateKeyError, PyMongoError

from database import connect_database, initialize_database
from security import password_hash


def main():
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('seed-demo')
    staff = commands.add_parser('create-staff')
    staff.add_argument('--email', required=True)
    staff.add_argument('--name', required=True)
    staff.add_argument('--role', required=True, choices=['nurse', 'doctor'])
    revoke = commands.add_parser('revoke-sessions')
    revoke.add_argument('--email', required=True)
    args = parser.parse_args()
    client, db = connect_database()
    try:
        initialize_database(db)
        if args.command == 'seed-demo':
            for identifier, name in [(1, 'Demo Emergency Department North'), (2, 'Demo Emergency Department South')]:
                db.emergencyDepartments.update_one({'establishmentID': identifier}, {'$setOnInsert': {
                    'establishmentID': identifier, 'name': name, 'address': 'Fictional demo location', 'currentLoad': 0,
                }}, upsert=True)
            print('Demo departments are ready. No patient data or default accounts were created.')
        elif args.command == 'create-staff':
            email = str(TypeAdapter(EmailStr).validate_python(args.email)).lower()
            password = getpass('Password (15–128 characters): ')
            if not 15 <= len(password) <= 128 or password != getpass('Confirm password: '):
                raise SystemExit('Passwords must match and contain 15–128 characters.')
            db.users.insert_one({'email': email, 'name': args.name, 'password_hash': password_hash.hash(password),
                                 'user_type': 2 if args.role == 'nurse' else 3, 'inTriage': 'false'})
            print('Staff account created.')
        else:
            email = str(TypeAdapter(EmailStr).validate_python(args.email)).lower()
            user = db.users.find_one({'email': email})
            if not user:
                raise SystemExit('User not found.')
            db.sessions.delete_many({'user_id': str(user['_id'])})
            print('Sessions revoked.')
    except DuplicateKeyError:
        raise SystemExit('Account already exists.')
    except PyMongoError:
        raise SystemExit('Database operation failed. Check backend configuration and database availability.')
    finally:
        client.close()


if __name__ == '__main__':
    main()
