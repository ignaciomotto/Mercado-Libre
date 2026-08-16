from sqlalchemy.orm import Session

from ..db.models.purchase_model import Purchase
from ..db.models.listing_model import Listing
from ..mappers.purchase_mapper import (
    purchase_create_to_model,
    purchase_to_response_dto
)
from ..schemas.purchase_schema import PurchaseCreate


class PurchaseService:

    def __init__(self, db: Session):
        self.db = db

    def get_purchases(self):
        purchases = self.db.query(Purchase).all()

        return [
            purchase_to_response_dto(purchase)
            for purchase in purchases
        ]

    def get_purchase(self, purchase_id: int):
        purchase = (
            self.db.query(Purchase)
            .filter(Purchase.id == purchase_id)
            .first()
        )

        if not purchase:
            return None

        return purchase_to_response_dto(purchase)

    def create_purchase(
        self,
        buyer_id: int,
        purchase_data: PurchaseCreate
    ):
        listing = (
            self.db.query(Listing)
            .filter(Listing.id == purchase_data.listing_id)
            .first()
        )

        if not listing:
            raise ValueError(
                "La publicación no existe"
            )

        if listing.status != "Active":
            raise ValueError(
                "La publicación no está activa"
            )

        if listing.seller_id == buyer_id:
            raise ValueError(
                "No podés comprar tu propia publicación"
            )

        if purchase_data.quantity <= 0:
            raise ValueError(
                "La cantidad debe ser mayor a cero"
            )

        if listing.stock < purchase_data.quantity:
            raise ValueError(
                "No hay stock suficiente"
            )

        total_price = (
            listing.price * purchase_data.quantity
        )

        listing.stock -= purchase_data.quantity

        if listing.stock == 0:
            listing.status = "Paused"

        purchase = purchase_create_to_model(
            buyer_id=buyer_id,
            listing_id=listing.id,
            quantity=purchase_data.quantity,
            total_price=total_price
        )

        self.db.add(purchase)
        self.db.commit()
        self.db.refresh(purchase)

        return purchase_to_response_dto(purchase)

    def complete_purchase(self, purchase_id: int):
        purchase = (
            self.db.query(Purchase)
            .filter(Purchase.id == purchase_id)
            .first()
        )

        if not purchase:
            return None

        if purchase.status == "Completed":
            raise ValueError(
                "La compra ya está finalizada"
            )

        if purchase.status == "Cancelled":
            raise ValueError(
                "No se puede finalizar una compra cancelada"
            )

        purchase.status = "Completed"

        self.db.commit()
        self.db.refresh(purchase)

        return purchase_to_response_dto(purchase)

    def cancel_purchase(self, purchase_id: int):
        purchase = (
            self.db.query(Purchase)
            .filter(Purchase.id == purchase_id)
            .first()
        )

        if not purchase:
            return None

        if purchase.status != "Pending":
            raise ValueError(
                "Solo se pueden cancelar compras pendientes"
            )

        listing = (
            self.db.query(Listing)
            .filter(Listing.id == purchase.listing_id)
            .first()
        )

        if not listing:
            raise ValueError(
                "La publicación asociada no existe"
            )

        # Devolver stock
        listing.stock += purchase.quantity

        # Si estaba pausada por falta de stock,
        # vuelve a estar activa
        if listing.status == "Paused":
            listing.status = "Active"

        # Cancelar compra
        purchase.status = "Cancelled"

        self.db.commit()
        self.db.refresh(purchase)

        return purchase_to_response_dto(purchase)