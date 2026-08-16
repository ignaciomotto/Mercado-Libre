from pydantic import BaseModel, Field


class ListingCreateDTO(BaseModel):
    seller_id: int
    title: str
    description: str
    price: float = Field(gt=0)
    stock: int = Field(gt=0)
    category_id: int


class ListingResponseDTO(BaseModel):
    id: int
    seller_id: int
    title: str
    description: str
    price: float
    stock: int
    category_id: int
    status: str