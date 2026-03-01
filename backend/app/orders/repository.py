from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.orders.models import Order, OrderItem
from app.orders.schemas import CreateOrderRequest


async def create_order(
    db: AsyncSession,
    data: CreateOrderRequest,
    user_id: int | None,
) -> Order:
    order = Order(
        user_id=user_id,
        customer_name=data.customer_name,
        email=data.email,
        address=data.address,
        city=data.city,
        phone=data.phone,
        payment_method=data.payment_method,
        total_amount=data.total_amount,
    )
    db.add(order)
    # Flush to get the order.id assigned before adding items
    await db.flush()

    for item_in in data.items:
        item = OrderItem(
            order_id=order.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
        )
        db.add(item)

    await db.commit()
    # Reload with products eagerly to populate product_name
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order.id)
    )
    return result.scalar_one()


def _orders_query():
    return select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    )


async def get_orders_by_user(db: AsyncSession, user_id: int) -> list[Order]:
    result = await db.execute(
        _orders_query()
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_all_orders(db: AsyncSession) -> list[Order]:
    result = await db.execute(
        _orders_query().order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_order(db: AsyncSession, order_id: int) -> Order | None:
    result = await db.execute(
        _orders_query().where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def update_order_status(db: AsyncSession, order_id: int, status: str) -> Order | None:
    order = await get_order(db, order_id)
    if order is None:
        return None
    order.status = status
    await db.commit()
    await db.refresh(order)
    return order
