from fastapi import APIRouter, Depends
from models.User import PatientRegister, PatientLogin, UserResponse
from services.auth_service import register_service, login_service, get_user_service, update_user_service
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

router = APIRouter()
security = HTTPBearer()

class TriageRequest(BaseModel):
    inTriage: str
    user_email: str

@router.post( "/register", response_model = UserResponse )
async def register( user: PatientRegister ):
    return await register_service( user )

@router.post( "/login", response_model = UserResponse )
async def login( user: PatientLogin ):
    return await login_service( user )

@router.get( "/user", response_model = UserResponse )
async def get_user( credentials: HTTPAuthorizationCredentials = Depends( security ) ):
    return await get_user_service( credentials.credentials )

@router.put( "/user" )
async def update_user(request: TriageRequest):
    return await update_user_service(request.user_email, request.inTriage)