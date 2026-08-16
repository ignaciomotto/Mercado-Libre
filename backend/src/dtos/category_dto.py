from pydantic import BaseModel, Field


class CategoryCreateDTO(BaseModel):
    name: str
    parent_id: int | None = None

class CategoryResponseDTO(BaseModel):
    id: int | None
    name: str
    parent_id: int | None

    class Config:
        from_attributes = True

class CategoryTreeDTO(BaseModel):
    id: int | None
    name: str
    children: list["CategoryTreeDTO"] = Field(
        default_factory=list
    )