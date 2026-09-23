from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError
from pwdlib.exceptions import UnknownHashError

from security import DUMMY_HASH, password_hash


def register_service(db, registration):
    data = registration.model_dump(exclude={'password'})
    data.update(password_hash=password_hash.hash(registration.password), user_type=1, inTriage='false')
    try:
        db.users.insert_one(data)
    except DuplicateKeyError:
        raise HTTPException(409, 'Unable to create account with these details')
    return data


def login_service(db, login):
    user = db.users.find_one({'email': login.email})
    try:
        valid = password_hash.verify(login.password, user.get('password_hash', DUMMY_HASH) if user else DUMMY_HASH)
    except (UnknownHashError, ValueError):
        valid = False
    if not valid or not user or user.get('disabled'):
        raise HTTPException(401, 'Invalid email or password')
    return user


def update_user_service(db, actor, email, state):
    if actor['user_type'] == 1:
        if email != actor['email'] or state != 'false' or actor['inTriage'] not in ('doctor', 'rejected'):
            raise HTTPException(403, 'This status change is not permitted')
    elif actor['user_type'] == 2:
        if state != 'rejected' or not db.VTTickets.find_one({'email': email}):
            raise HTTPException(403, 'This status change is not permitted')
    elif actor['user_type'] == 3:
        if state != 'doctor' or not db.medicalTickets.find_one({'VTTicket.email': email}):
            raise HTTPException(403, 'This status change is not permitted')
    if not db.users.update_one({'email': email, 'user_type': 1}, {'$set': {'inTriage': state}}).matched_count:
        raise HTTPException(404, 'Patient not found')
    return {'message': 'User status updated', 'value': state}
