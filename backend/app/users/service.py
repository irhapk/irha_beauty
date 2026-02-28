from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.users import repository
from app.users.schemas import UserCreate, UserRead, UserUpdate


async def create_user(db: AsyncSession, data: UserCreate) -> UserRead:
    existing = await repository.get_user_by_email(db, str(data.email))
    if existing:
        raise AppException(
            detail="A user with this email already exists",
            code="EMAIL_ALREADY_EXISTS",
            status_code=409,
        )
    user = await repository.create_user(db, data)
    return UserRead.model_validate(user)


async def list_users(db: AsyncSession) -> list[UserRead]:
    users = await repository.list_users(db)
    return [UserRead.model_validate(u) for u in users]


async def get_user(db: AsyncSession, user_id: int) -> UserRead:
    user = await repository.get_user(db, user_id)
    if user is None:
        raise AppException(
            detail="User not found",
            code="USER_NOT_FOUND",
            status_code=404,
        )
    return UserRead.model_validate(user)


async def update_user(
    db: AsyncSession, user_id: int, data: UserUpdate
) -> UserRead:
    user = await repository.get_user(db, user_id)
    if user is None:
        raise AppException(
            detail="User not found",
            code="USER_NOT_FOUND",
            status_code=404,
        )
    if data.email is not None:
        existing = await repository.get_user_by_email(db, str(data.email))
        if existing and existing.id != user_id:
            raise AppException(
                detail="A user with this email already exists",
                code="EMAIL_ALREADY_EXISTS",
                status_code=409,
            )
    updated = await repository.update_user(db, user, data)
    return UserRead.model_validate(updated)


async def delete_user(db: AsyncSession, user_id: int) -> None:
    user = await repository.get_user(db, user_id)
    if user is None:
        raise AppException(
            detail="User not found",
            code="USER_NOT_FOUND",
            status_code=404,
        )
    await repository.delete_user(db, user)
