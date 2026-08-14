from sqlalchemy import Column, Integer, String, DateTime, Numeric, func

from src.db.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    registration_date = Column(DateTime, server_default=func.now())
    reputation = Column(Numeric, server_default=0.00)
