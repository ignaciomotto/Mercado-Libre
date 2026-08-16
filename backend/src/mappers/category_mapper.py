from src.db.models.category_model import Category
from src.dtos.category_dto import (
    CategoryCreateDTO,
    CategoryResponseDTO,
    CategoryTreeDTO
)


def category_create_to_model(dto: CategoryCreateDTO) -> Category:
    return Category(
        name=dto.name,
        parent_id=dto.parent_id
    )


def category_to_response_dto(
    category: Category
) -> CategoryResponseDTO:

    return CategoryResponseDTO(
        id=category.id,
        name=category.name,
        parent_id=category.parent_id
    )


def category_to_tree_dto(
    category: Category
) -> CategoryTreeDTO:

    return CategoryTreeDTO(
        id=category.id,
        name=category.name,
        children=[
            category_to_tree_dto(child)
            for child in category.children
        ]
    )