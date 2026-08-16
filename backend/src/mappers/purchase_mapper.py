from src.db.models.purchase_model import Purchase
from src.dtos.purchase_dto import (
    PurchaseCreateDTO,
    PurchaseResponseDTO
)


def purchase_create_to_model(
    dto: PurchaseCreateDTO,
    listing_id: int,
    total: float
) -> Purchase:

    return Purchase(
        listing_id=listing_id,
        buyer_id=dto.buyer_id,
        quantity=dto.quantity,
        total=total,
        status="pending"
    )


def purchase_to_response_dto(
    purchase: Purchase
) -> PurchaseResponseDTO:

    return PurchaseResponseDTO(
        id=purchase.id,
        listing_id=purchase.listing_id,
        buyer_id=purchase.buyer_id,
        quantity=purchase.quantity,
        date=purchase.date,
        total=purchase.total,
        status=purchase.status
    )