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
    rating_count: int = 0


class TopSellerDTO(BaseModel):
    id: int
    name: str
    email: EmailStr
    reputation: float
    completed_sales: int
    registration_date: datetime
    rating_count: int