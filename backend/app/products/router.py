from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.products import service
from app.products.schemas import ProductCreate, ProductRead, ProductUpdate
from app.core.deps import get_db

router = APIRouter()


@router.post("", response_model=ProductRead, status_code=201)
async def create_product(
    data: ProductCreate, db: AsyncSession = Depends(get_db)
) -> ProductRead:
    return await service.create_product(db, data)


@router.get("", response_model=list[ProductRead])
async def list_products(db: AsyncSession = Depends(get_db)) -> list[ProductRead]:
    return await service.list_products(db)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: int, db: AsyncSession = Depends(get_db)
) -> ProductRead:
    return await service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)
) -> ProductRead:
    return await service.update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: int, db: AsyncSession = Depends(get_db)
) -> None:
    await service.delete_product(db, product_id)
