from pydantic import BaseModel, Field


class ListingCreateDTO(BaseModel):
    seller_id: int
    title: str
    description: str
    price: float = Field(gt=0)
    stock: int = Field(gt=0)
    category_id: int | None


class ListingResponseDTO(BaseModel):
    id: int
    seller_id: int
    title: str
    description: str
    price: float
    stock: int
    category_id: int | None
    status: str


class TopListingDTO(BaseModel):
    listing_id: int
    title: str
    price: float
    category_id: int
    units_sold: int