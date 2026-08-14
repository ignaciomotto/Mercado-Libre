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
    total: float
    status: str

    class Config:
        from_attributes = True