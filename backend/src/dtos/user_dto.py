from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserCreateDTO(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)


class UserResponseDTO(BaseModel):
    id: int
    email: EmailStr
    name: str
    registration_date: datetime
    reputation: float | None