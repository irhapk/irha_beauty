from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.orders import repository
from app.orders.schemas import CreateOrderRequest, OrderRead
from app.products import repository as product_repo
from app.users.models import User


async def create_order(
    db: AsyncSession,
    data: CreateOrderRequest,
    current_user: User,
) -> OrderRead:
    # Validate all product IDs exist before inserting anything
    for item in data.items:
        product = await product_repo.get_product(db, item.product_id)
        if product is None:
            raise AppException(
                detail=f"Product {item.product_id} not found",
                code="PRODUCT_NOT_FOUND",
                status_code=404,
            )

    order = await repository.create_order(db, data, current_user.id)
    return OrderRead.model_validate(order)


async def get_my_orders(db: AsyncSession, current_user: User) -> list[OrderRead]:
    orders = await repository.get_orders_by_user(db, current_user.id)
    return [OrderRead.model_validate(o) for o in orders]


async def get_all_orders(db: AsyncSession) -> list[OrderRead]:
    orders = await repository.get_all_orders(db)
    return [OrderRead.model_validate(o) for o in orders]


async def update_order_status(
    db: AsyncSession, order_id: int, status: str
) -> OrderRead:
    order = await repository.update_order_status(db, order_id, status)
    if order is None:
        raise AppException(
            detail=f"Order {order_id} not found",
            code="ORDER_NOT_FOUND",
            status_code=404,
        )
    return OrderRead.model_validate(order)
