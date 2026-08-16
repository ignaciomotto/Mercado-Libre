from src.db.models.user_model import User
from src.dtos.user_dto import UserCreateDTO, UserResponseDTO


def user_create_to_model(dto: UserCreateDTO) -> User:
    return User(
        email=dto.email,
        password=dto.password,
        name=dto.name
    )


def user_to_response_dto(user: User) -> UserResponseDTO:
    return UserResponseDTO(
        id=user.id,
        email=user.email,
        name=user.name,
        registration_date=user.registration_date,
        reputation=user.reputation
    )