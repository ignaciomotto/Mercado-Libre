from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.connection import get_db
from ..schemas.category_schema import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryTreeResponse
)
from ..services.category_service import CategoryService
from ..dtos.listing_dto import TopListingDTO


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.get(
    "/",
    response_model=list[CategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    return service.get_categories()


@router.get(
    "/tree",
    response_model=list[CategoryTreeResponse]
)
def get_category_tree(
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    return service.get_category_tree()

@router.get(
    "/{category_id}/top-listings",
    response_model=list[TopListingDTO]
)
def get_top_listings(
    category_id: int,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    listings = service.get_top_listings(category_id)

    if listings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return listings

@router.get(
    "/{category_id}",
    response_model=CategoryResponse
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    category = service.get_category(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return category


@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    try:
        return service.create_category(category_data)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.put(
    "/{category_id}",
    response_model=CategoryResponse
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    try:
        category = service.update_category(
            category_id,
            category_data
        )

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

        return category

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)

    deleted = service.delete_category(category_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return None