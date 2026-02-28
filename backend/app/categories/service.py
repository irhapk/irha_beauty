from sqlalchemy.ext.asyncio import AsyncSession

from app.categories import repository
from app.categories.schemas import CategoryCreate, CategoryRead, CategoryUpdate
from app.core.exceptions import AppException


async def create_category(db: AsyncSession, data: CategoryCreate) -> CategoryRead:
    existing = await repository.get_category_by_name(db, data.name)
    if existing:
        raise AppException(
            detail="A category with this name already exists",
            code="CATEGORY_ALREADY_EXISTS",
            status_code=409,
        )
    category = await repository.create_category(db, data)
    return CategoryRead.model_validate(category)


async def list_categories(db: AsyncSession) -> list[CategoryRead]:
    categories = await repository.list_categories(db)
    return [CategoryRead.model_validate(c) for c in categories]


async def get_category(db: AsyncSession, category_id: int) -> CategoryRead:
    category = await repository.get_category(db, category_id)
    if category is None:
        raise AppException(
            detail="Category not found",
            code="CATEGORY_NOT_FOUND",
            status_code=404,
        )
    return CategoryRead.model_validate(category)


async def update_category(
    db: AsyncSession, category_id: int, data: CategoryUpdate
) -> CategoryRead:
    category = await repository.get_category(db, category_id)
    if category is None:
        raise AppException(
            detail="Category not found",
            code="CATEGORY_NOT_FOUND",
            status_code=404,
        )
    if data.name is not None:
        new_name = data.name.strip()
        if new_name.lower() != category.name.lower():
            existing = await repository.get_category_by_name(db, new_name)
            if existing:
                raise AppException(
                    detail="A category with this name already exists",
                    code="CATEGORY_ALREADY_EXISTS",
                    status_code=409,
                )
    updated = await repository.update_category(db, category, data)
    return CategoryRead.model_validate(updated)


async def delete_category(db: AsyncSession, category_id: int) -> None:
    category = await repository.get_category(db, category_id)
    if category is None:
        raise AppException(
            detail="Category not found",
            code="CATEGORY_NOT_FOUND",
            status_code=404,
        )
    count = await repository.count_products_by_category(db, category_id)
    if count > 0:
        raise AppException(
            detail="Cannot delete category with associated products",
            code="CATEGORY_HAS_PRODUCTS",
            status_code=409,
        )
    await repository.delete_category(db, category)
