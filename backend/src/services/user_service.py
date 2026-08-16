from sqlalchemy.orm import Session

from src.db.models.user_model import User
from src.dtos.user_dto import UserCreateDTO, UserResponseDTO
from src.mappers.user_mapper import (
    user_create_to_model,
    user_to_response_dto
)


class UserService:

    @staticmethod
    def create_user(
        db: Session,
        dto: UserCreateDTO
    ) -> UserResponseDTO:

        existing_user = (
            db.query(User)
            .filter(User.email == dto.email)
            .first()
        )

        if existing_user:
            raise ValueError("Email already registered")

        user = user_create_to_model(dto)

        # HU1
        user.reputation = 0.0

        db.add(user)
        db.commit()
        db.refresh(user)

        return user_to_response_dto(user)