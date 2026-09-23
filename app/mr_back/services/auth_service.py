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
    # This endpoint only acknowledges a completed workflow; staff use transactions.
    if actor['user_type'] != 1 or email != actor['email'] or state != 'false':
        raise HTTPException(403, 'This status change is not permitted')
    result = db.users.update_one(
        {'_id': actor['_id'], 'user_type': 1, 'inTriage': {'$in': ['doctor', 'rejected']}},
        {'$set': {'inTriage': 'false'}},
    )
    if not result.matched_count:
        raise HTTPException(403, 'This status change is not permitted')
    return {'message': 'User status updated', 'value': 'false'}
