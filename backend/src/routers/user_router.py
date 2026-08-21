from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.connection import get_db
from ..schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserResponse
)
from ..db.models.user_model import User
from ..services.user_service import UserService
from ..schemas.listing_schema import ListingResponseSchema
from ..dtos.purchase_dto import PurchaseHistoryDTO
from ..dtos.user_dto import TopSellerDTO

from ..dependencies.auth import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_users(
    db: Session = Depends(get_db)
):
    service = UserService(db)

    return service.get_users()

@router.get(
    "/sellers/top",
    response_model=list[TopSellerDTO]
)
def get_top_sellers(
    db: Session = Depends(get_db)
):
    service = UserService(db)

    return service.get_top_sellers()

@router.get(
    "/{user_id}/purchases",
    response_model=list[PurchaseHistoryDTO]
)
def get_user_purchase_history(
    user_id: int,
    status: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (user_id, 1):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    
    service = UserService(db)

    try:
        purchases = service.get_user_purchase_history(
            user_id,
            status
        )

        if purchases is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return purchases

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

@router.get(
    "/{user_id}/publications",
    response_model=list[ListingResponseSchema]
)
def get_user_listings(
    user_id: int,
    db: Session = Depends(get_db)
):
    service = UserService(db)

    listings = service.get_user_listings(user_id)

    if listings is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return listings

@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    service = UserService(db)

    user = service.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    service = UserService(db)

    try:
        return service.create_user(user_data)

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.put(
    "/{user_id}",
    response_model=UserResponse
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = UserService(db)

    try:
        if not current_user.id in (user_id, 1):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated"
            )

        user = service.update_user(
            user_id,
            user_data
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (user_id, 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = UserService(db)

    deleted = service.delete_user(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return None