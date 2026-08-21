from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.connection import get_db
from ..schemas.purchase_schema import (
    PurchaseCreate,
    PurchaseResponse
)
from ..db.models.user_model import User
from ..services.purchase_service import PurchaseService
from ..dependencies.auth import get_current_user
from ..repositories.purchase_repository import PurchaseRepository


router = APIRouter(
    prefix="/purchases",
    tags=["Purchases"]
)


@router.get(
    "/",
    response_model=list[PurchaseResponse]
)
def get_purchases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != 1:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = PurchaseService(db)

    return service.get_purchases()


@router.get(
    "/{purchase_id}",
    response_model=PurchaseResponse
)
def get_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (PurchaseRepository.get_buyer_id_by_purchase_id(db, purchase_id), 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = PurchaseService(db)

    purchase = service.get_purchase(purchase_id)

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )

    return purchase


@router.post(
    "/",
    response_model=PurchaseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_purchase(
    purchase_data: PurchaseCreate,
    buyer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (buyer_id, 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = PurchaseService(db)

    try:
        return service.create_purchase(
            buyer_id,
            purchase_data
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

@router.put(
    "/{purchase_id}/complete",
    response_model=PurchaseResponse
)
def complete_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (PurchaseRepository.get_buyer_id_by_purchase_id(db, purchase_id), 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = PurchaseService(db)

    try:
        purchase = service.complete_purchase(
            purchase_id
        )

        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )

        return purchase

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

@router.put(
    "/{purchase_id}/cancel",
    response_model=PurchaseResponse
)
def cancel_purchase(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (PurchaseRepository.get_buyer_id_by_purchase_id(db, purchase_id), 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = PurchaseService(db)

    try:
        purchase = service.cancel_purchase(
            purchase_id
        )

        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )

        return purchase

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )