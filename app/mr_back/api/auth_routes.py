from typing import Literal

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, ConfigDict, EmailStr

from config import get_settings
from models.User import PatientRegister, PatientLogin, UserResponse
from security import auth_rate_limit, current_user, issue_session, session_digest
from services.auth_service import register_service, login_service, update_user_service

router = APIRouter()


class TriageRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    inTriage: Literal['false', 'rejected', 'doctor']
    user_email: EmailStr


@router.post('/register', response_model=UserResponse, dependencies=[Depends(auth_rate_limit)])
def register(user: PatientRegister, request: Request, response: Response):
    user = register_service(request.app.state.db, user)
    issue_session(request, response, user)
    return user


@router.post('/login', response_model=UserResponse, dependencies=[Depends(auth_rate_limit)])
def login(user: PatientLogin, request: Request, response: Response):
    user = login_service(request.app.state.db, user)
    issue_session(request, response, user)
    return user


@router.get('/user', response_model=UserResponse)
def get_user(user=Depends(current_user)):
    return user


@router.post('/logout', status_code=204)
def logout(request: Request, response: Response):
    settings = get_settings()
    token = request.cookies.get(settings.cookie_name)
    if token:
        request.app.state.db.sessions.delete_one({'_id': session_digest(token)})
    response.delete_cookie(settings.cookie_name, path='/', secure=settings.app_env == 'production', httponly=True, samesite='strict')


@router.put('/user')
def update_user(data: TriageRequest, request: Request, user=Depends(current_user)):
    return update_user_service(request.app.state.db, user, str(data.user_email).lower(), data.inTriage)
