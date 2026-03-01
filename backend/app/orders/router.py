from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_admin_user, get_current_user, get_db
from app.core.exceptions import AppException
from app.orders import service
from app.orders.schemas import CreateOrderRequest, OrderRead, UpdateOrderStatusRequest
from app.users.models import User

router = APIRouter()


@router.post("", response_model=OrderRead, status_code=201)
async def create_order(
    data: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderRead:
    return await service.create_order(db, data, current_user)


@router.get("/my", response_model=list[OrderRead])
async def get_my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OrderRead]:
    return await service.get_my_orders(db, current_user)


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@router.get("/all", response_model=list[OrderRead])
async def admin_get_all_orders(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
) -> list[OrderRead]:
    return await service.get_all_orders(db)


@router.patch("/{order_id}/status", response_model=OrderRead)
async def admin_update_order_status(
    order_id: int,
    data: UpdateOrderStatusRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_admin_user),
) -> OrderRead:
    return await service.update_order_status(db, order_id, data.status)
