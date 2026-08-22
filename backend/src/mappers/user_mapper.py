from src.db.models.user_model import User
from src.dtos.user_dto import UserCreateDTO, UserResponseDTO
from src.utils.hash import hash_password


def user_create_to_model(dto: UserCreateDTO) -> User:
    return User(
        email=dto.email,
        password=hash_password(dto.password),
        name=dto.name
    )


def user_to_response_dto(user: User, reputation=None, rating_count=0) -> UserResponseDTO:
    return UserResponseDTO(
        id=user.id,
        email=user.email,
        name=user.name,
        registration_date = user.registration_date,
        reputation=reputation,
        rating_count=rating_count
    )