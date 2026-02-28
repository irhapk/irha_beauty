from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories import service
from app.categories.schemas import CategoryCreate, CategoryRead, CategoryUpdate
from app.core.deps import get_db

router = APIRouter()


@router.post("", response_model=CategoryRead, status_code=201)
async def create_category(
    data: CategoryCreate, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    return await service.create_category(db, data)


@router.get("", response_model=list[CategoryRead])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryRead]:
    return await service.list_categories(db)


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: int, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    return await service.get_category(db, category_id)


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db)
) -> CategoryRead:
    return await service.update_category(db, category_id, data)


@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: int, db: AsyncSession = Depends(get_db)
) -> None:
    await service.delete_category(db, category_id)
