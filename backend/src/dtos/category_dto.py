from pydantic import BaseModel


class CategoryCreateDTO(BaseModel):
    name: str
    parent_id: int | None = None


class CategoryResponseDTO(BaseModel):
    id: int
    name: str
    parent_id: int | None

    class Config:
        from_attributes = True