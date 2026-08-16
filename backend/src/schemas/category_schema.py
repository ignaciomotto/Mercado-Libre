from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str
    parent_id: int | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    parent_id: int | None = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    parent_id: int | None = None


class CategoryTreeResponse(BaseModel):
    id: int
    name: str
    children: list["CategoryTreeResponse"] = Field(
        default_factory=list
    )


CategoryTreeResponse.model_rebuild()