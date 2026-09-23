from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class PatientLogin(BaseModel):
    model_config = ConfigDict(extra='forbid', str_max_length=256)
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def normalize_email(cls, value):
        return str(value).lower()


class PatientRegister(PatientLogin):
    name: str = Field(min_length=1, max_length=100)
    dateOfBirth: str
    gender: str
    streetAddress: str
    city: str
    province: str
    country: str
    postalCode: str
    healthNumber: str
    password: str = Field(min_length=15, max_length=128)
    user_type: Literal[1] = 1
    inTriage: Literal['false'] = 'false'


class UserResponse(BaseModel):
    email: str
    user_type: int
    name: str
    inTriage: str
