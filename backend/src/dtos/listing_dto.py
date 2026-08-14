from pydantic import BaseModel


class ListingCreateDTO(BaseModel):
    seller_id: int
    title: str
    description: str
    price: float
    stock: int
    category_id: int
    status: str


class ListingResponseDTO(BaseModel):
    id: int
    seller_id: int
    title: str
    description: str
    price: float
    stock: int
    category_id: int
    status: str

    class Config:
        from_attributes = True