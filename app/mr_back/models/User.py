from pydantic import BaseModel

class PatientLogin( BaseModel ):
    email: str
    password: str

class PatientRegister( BaseModel ):
    name: str
    dateOfBirth: str
    gender: str
    streetAddress: str
    city: str
    province: str
    country: str
    postalCode: str
    healthNumber: str
    email: str
    password: str
    user_type: int
    inTriage: str

class UserResponse( BaseModel ):
    email: str
    password: str
    user_type: int
    token: str
    name: str
    inTriage: str

class UserType( BaseModel ):
    user_type: int
    description: str
