from pydantic import BaseModel

class User( BaseModel ):
    UserID: int
    email: str
    password: str
    user_type: int

class UserType( BaseModel ):
    user_type: int
    description: str
