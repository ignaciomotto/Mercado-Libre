from src.db.models.purchase_model import Purchase
from src.dtos.purchase_dto import (
    PurchaseCreateDTO,
    PurchaseResponseDTO
)
from ..dtos.purchase_dto import PurchaseHistoryDTO

def purchase_create_to_model(
    buyer_id: int,
    listing_id: int,
    quantity: int,
    total_price: float
):
    return Purchase(
        buyer_id=buyer_id,
        listing_id=listing_id,
        quantity=quantity,
        total_price=total_price,
        status="Pending"
    )


def purchase_to_response_dto(purchase):
    return PurchaseResponseDTO(
        id=purchase.id,
        buyer_id=purchase.buyer_id,
        listing_id=purchase.listing_id,
        quantity=purchase.quantity,
        total_price=float(purchase.total_price),
        status=purchase.status,
        date=purchase.date
    )

def purchase_to_history_dto(
    purchase,
    listing,
    seller
):
    return PurchaseHistoryDTO(
        id=purchase.id,
        quantity=purchase.quantity,
        total_price=float(purchase.total_price),
        status=purchase.status,
        date=purchase.date,

        listing_id=listing.id,
        listing_title=listing.title,
        listing_description=listing.description,
        listing_price=float(listing.price),

        seller_id=seller.id,
        seller_name=seller.name,
        seller_email=seller.email
    )