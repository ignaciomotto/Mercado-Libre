from sqlalchemy import Column, Integer, String, func

from src.db.connection import Base

class rating(Base):
    __tablename__ = "ratings"

    id          = Column(Integer, primary_key=True)
    purchase_id = Column(Integer, nullable=False)
    seller_id   = Column(Integer, nullable=False)
    reciever_id = Column (Integer,nullable = False)
    score       = Column (Integer,nullable = False)
    comment     = Column (String,nullable = True)