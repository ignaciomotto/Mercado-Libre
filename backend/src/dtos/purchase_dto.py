from datetime import datetime
from pydantic import BaseModel


class PurchaseCreateDTO(BaseModel):
    listing_id: int
    buyer_id: int
    quantity: int


class PurchaseResponseDTO(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    quantity: int
    date: datetime
    total_price: float
    status: str

    class Config:
        from_attributes = True

class PurchaseHistoryDTO(BaseModel):
    id: int
    quantity: int
    total_price: float
    status: str
    date: datetime

    listing_id: int
    listing_title: str
    listing_description: str
    listing_price: float

    seller_id: int
    seller_name: str
    seller_email: str
    listing_stock: int
    listing_category_id: int | None
    listing_status: str
    seller_registration_date: datetime
    seller_reputation: float | None
    seller_rating_count: int