from sqlalchemy import Column, Integer, String, DateTime, Numeric, func

from src.db.connection import Base


class Purchase(Base):
    __tablename__ = "purchase"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, nullable=False)
    buyer_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(DateTime, server_default=func.now())
    total_price = Column(Numeric, nullable=False)
    status = Column(String, nullable=False)