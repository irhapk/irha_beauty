from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.users import service
from app.users.schemas import UserCreate, UserRead, UserUpdate
from app.core.deps import get_db

router = APIRouter()


@router.post("", response_model=UserRead, status_code=201)
async def create_user(
    data: UserCreate, db: AsyncSession = Depends(get_db)
) -> UserRead:
    return await service.create_user(db, data)


@router.get("", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db)) -> list[UserRead]:
    return await service.list_users(db)


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)) -> UserRead:
    return await service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int, data: UserUpdate, db: AsyncSession = Depends(get_db)
) -> UserRead:
    return await service.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)) -> None:
    await service.delete_user(db, user_id)
