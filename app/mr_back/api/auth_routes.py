from fastapi import APIRouter, Depends
from models.User import PatientRegister, PatientLogin, UserResponse
from services.auth_service import register_service, login_service, get_user_service
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()


@router.post( "/register", response_model = UserResponse )
async def register( user: PatientRegister ):
    return await register_service( user )

@router.post( "/login", response_model = UserResponse )
async def login( user: PatientLogin ):
    return await login_service( user )

@router.get( "/user", response_model = UserResponse )
async def get_user( credentials: HTTPAuthorizationCredentials = Depends( security ) ):
    return await get_user_service( credentials.credentials )