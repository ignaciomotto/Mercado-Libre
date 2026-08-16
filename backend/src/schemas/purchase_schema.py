from pydantic import BaseModel


class PurchaseCreate(BaseModel):
    listing_id: int
    quantity: int


class PurchaseResponse(BaseModel):
    id: int
    buyer_id: int
    listing_id: int
    quantity: int
    total_price: float
    status: str