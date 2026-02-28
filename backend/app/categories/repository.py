from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories.models import Category
from app.categories.schemas import CategoryCreate, CategoryUpdate


async def create_category(db: AsyncSession, data: CategoryCreate) -> Category:
    category = Category(
        name=data.name.strip(),
        description=data.description,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def list_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.id))
    return list(result.scalars().all())


async def get_category(db: AsyncSession, category_id: int) -> Category | None:
    return await db.get(Category, category_id)


async def get_category_by_name(db: AsyncSession, name: str) -> Category | None:
    result = await db.execute(
        select(Category).where(func.lower(Category.name) == name.strip().lower())
    )
    return result.scalar_one_or_none()


async def update_category(
    db: AsyncSession, category: Category, data: CategoryUpdate
) -> Category:
    if data.name is not None:
        category.name = data.name.strip()
    if data.description is not None:
        category.description = data.description
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category: Category) -> None:
    await db.delete(category)
    await db.commit()


async def count_products_by_category(db: AsyncSession, category_id: int) -> int:
    from app.products.models import Product  # local import avoids circular at module load

    result = await db.execute(
        select(func.count()).select_from(Product).where(Product.category_id == category_id)
    )
    return result.scalar_one()
