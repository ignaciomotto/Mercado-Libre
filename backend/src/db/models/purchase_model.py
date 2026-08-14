from sqlalchemy import Column, Integer, String, DateTime, Numeric, func

from src.db.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, nullable=False)
    buyer_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(DateTime, server_default=func.now())
    total = Column(Numeric, nullable=False)
    status = Column(String, nullable=False)