import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import Depends, HTTPException, Request, Response
from pwdlib import PasswordHash
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from config import get_settings

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash(secrets.token_urlsafe(32))


def session_digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def issue_session(request: Request, response: Response, user):
    settings = get_settings()
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    db = request.app.state.db
    previous = request.cookies.get(settings.cookie_name)
    if previous:
        db.sessions.delete_one({'_id': session_digest(previous)})
    db.sessions.insert_one({
        '_id': session_digest(token), 'user_id': str(user['_id']),
        'expires_at': now + timedelta(minutes=settings.session_minutes),
    })
    response.set_cookie(settings.cookie_name, token, httponly=True,
                        secure=settings.app_env == 'production', samesite='strict',
                        max_age=settings.session_minutes * 60, path='/')


def current_user(request: Request):
    token = request.cookies.get(get_settings().cookie_name, '')
    if not token or len(token) > 128:
        raise HTTPException(401, 'Authentication required')
    db = request.app.state.db
    session = db.sessions.find_one({'_id': session_digest(token), 'expires_at': {'$gt': datetime.now(timezone.utc)}})
    if not session or not ObjectId.is_valid(session['user_id']):
        raise HTTPException(401, 'Session expired or invalid')
    user = db.users.find_one({'_id': ObjectId(session['user_id']), 'disabled': {'$ne': True}})
    if not user or user.get('user_type') not in (1, 2, 3):
        raise HTTPException(401, 'Session expired or invalid')
    return user


def require_roles(*roles):
    def dependency(user=Depends(current_user)):
        if user['user_type'] not in roles:
            raise HTTPException(403, 'Insufficient permissions')
        return user
    return dependency


def auth_rate_limit(request: Request):
    # Shared by workers; only configure trusted reverse proxies in Uvicorn.
    now = datetime.now(timezone.utc)
    window = int(now.timestamp()) // 900
    ip = request.client.host if request.client else 'unknown'
    key = session_digest(f'{ip}:{window}')
    db = request.app.state.db
    try:
        record = db.rate_limits.find_one_and_update(
            {'_id': key}, {'$inc': {'count': 1}, '$setOnInsert': {'expires_at': now + timedelta(minutes=30)}},
            upsert=True, return_document=ReturnDocument.AFTER)
    except DuplicateKeyError:
        record = db.rate_limits.find_one_and_update({'_id': key}, {'$inc': {'count': 1}}, return_document=ReturnDocument.AFTER)
    if record['count'] > 20:
        raise HTTPException(429, 'Too many attempts. Try again later.', headers={'Retry-After': '900'})
