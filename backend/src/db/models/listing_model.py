from sqlalchemy import Column, Integer, String, Numeric, func

from src.db.connection import Base

class Listing(Base):
    __tablename__ = "listing"

    id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Numeric, nullable=False)
    stock = Column(Integer, nullable=False)
    category_id = Column(Integer, nullable=True)
    status = Column(String, nullable=False, server_default="Active")