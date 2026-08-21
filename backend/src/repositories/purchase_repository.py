from sqlalchemy.orm import Session

from ..db.models.purchase_model import Purchase


class PurchaseRepository:

    @staticmethod
    def get_by_id(
        db: Session,
        purchase_id: int
    ):
        return (
            db.query(Purchase)
            .filter(Purchase.id == purchase_id)
            .first()
        )

    @staticmethod
    def get_buyer_id_by_purchase_id(
        db: Session,
        purchase_id: int
    ):
        result = (
            db.query(Purchase.buyer_id)
            .filter(Purchase.id == purchase_id)
            .first()
        )

        if not result:
            return None

        return result[0]