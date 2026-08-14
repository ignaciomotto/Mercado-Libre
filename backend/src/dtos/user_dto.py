from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserResponseDTO(BaseModel):
    id: int
    email: EmailStr
    name: str
    registration_date: datetime
    reputation: float

    class Config:
        from_attributes = True