from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class ListingCreateSchema(BaseModel):
    seller_id: int
    title: str = Field(min_length=1, max_length=200)
    description: str
    price: float = Field(gt=0)
    stock: int = Field(gt=0)
    category_id: Optional[int] = None


class ListingResponseSchema(BaseModel):
    id: int
    seller_id: int
    title: str
    description: str
    price: float
    stock: int
    category_id: Optional[int] = None
    status: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    status: Optional[str] = None