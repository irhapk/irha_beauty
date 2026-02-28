from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.products.models import Product
from app.products.schemas import ProductCreate, ProductUpdate


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(
        name=data.name.strip(),
        description=data.description,
        price=data.price,
        stock=data.stock,
        category_id=data.category_id,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def list_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).order_by(Product.id))
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    return await db.get(Product, product_id)


async def update_product(
    db: AsyncSession, product: Product, data: ProductUpdate
) -> Product:
    if data.name is not None:
        product.name = data.name.strip()
    if data.description is not None:
        product.description = data.description
    if data.price is not None:
        product.price = data.price
    if data.stock is not None:
        product.stock = data.stock
    if data.category_id is not None:
        product.category_id = data.category_id
    await db.commit()
    await db.refresh(product)
    return product


async def delete_product(db: AsyncSession, product: Product) -> None:
    await db.delete(product)
    await db.commit()
