from sqlalchemy.ext.asyncio import AsyncSession

from app.categories import repository as category_repo
from app.core.exceptions import AppException
from app.products import repository
from app.products.schemas import ProductCreate, ProductRead, ProductUpdate


async def create_product(db: AsyncSession, data: ProductCreate) -> ProductRead:
    category = await category_repo.get_category(db, data.category_id)
    if category is None:
        raise AppException(
            detail="Category not found",
            code="CATEGORY_NOT_FOUND",
            status_code=404,
        )
    product = await repository.create_product(db, data)
    return ProductRead.model_validate(product)


async def list_products(db: AsyncSession) -> list[ProductRead]:
    products = await repository.list_products(db)
    return [ProductRead.model_validate(p) for p in products]


async def get_product(db: AsyncSession, product_id: int) -> ProductRead:
    product = await repository.get_product(db, product_id)
    if product is None:
        raise AppException(
            detail="Product not found",
            code="PRODUCT_NOT_FOUND",
            status_code=404,
        )
    return ProductRead.model_validate(product)


async def update_product(
    db: AsyncSession, product_id: int, data: ProductUpdate
) -> ProductRead:
    product = await repository.get_product(db, product_id)
    if product is None:
        raise AppException(
            detail="Product not found",
            code="PRODUCT_NOT_FOUND",
            status_code=404,
        )
    if data.category_id is not None:
        category = await category_repo.get_category(db, data.category_id)
        if category is None:
            raise AppException(
                detail="Category not found",
                code="CATEGORY_NOT_FOUND",
                status_code=404,
            )
    updated = await repository.update_product(db, product, data)
    return ProductRead.model_validate(updated)


async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await repository.get_product(db, product_id)
    if product is None:
        raise AppException(
            detail="Product not found",
            code="PRODUCT_NOT_FOUND",
            status_code=404,
        )
    await repository.delete_product(db, product)
