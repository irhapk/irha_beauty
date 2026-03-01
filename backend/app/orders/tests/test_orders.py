import pytest
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories.schemas import CategoryCreate
from app.categories import service as category_service
from app.products.schemas import ProductCreate
from app.products import service as product_service


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _seed_product(db: AsyncSession) -> dict:
    """Create a category + product and return product info."""
    category = await category_service.create_category(db, CategoryCreate(name="Oils"))
    product = await product_service.create_product(
        db,
        ProductCreate(
            name="Argan Oil",
            description="Pure argan oil",
            price=25.99,
            stock=10,
            category_id=category.id,
        ),
    )
    return {"product_id": product.id, "unit_price": float(product.price)}


def _order_payload(product_id: int, unit_price: float) -> dict:
    return {
        "customer_name": "Test Customer",
        "address": "123 Main St",
        "city": "Karachi",
        "phone": "03001234567",
        "payment_method": "cod",
        "total_amount": unit_price * 2,
        "items": [
            {
                "product_id": product_id,
                "quantity": 2,
                "unit_price": unit_price,
            }
        ],
    }


async def _register_and_login(async_client: httpx.AsyncClient) -> None:
    """Register + login via HTTP so the test client receives the auth cookie."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Order User",
            "email": "order@test.com",
            "password": "Password1!",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "order@test.com", "password": "Password1!"},
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_order_guest(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """POST /orders without auth cookie → 201, user_id is null."""
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    response = await async_client.post("/api/v1/orders", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["user_id"] is None
    assert body["status"] == "pending"
    assert body["payment_method"] == "cod"
    assert len(body["items"]) == 1


@pytest.mark.asyncio
async def test_create_order_authenticated(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """POST /orders with valid auth cookie → 201, order linked to user."""
    await _register_and_login(async_client)
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    response = await async_client.post("/api/v1/orders", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["user_id"] is not None
    assert body["customer_name"] == "Test Customer"


@pytest.mark.asyncio
async def test_get_my_orders_authenticated(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """GET /orders/my with valid auth → 200, returns user's orders."""
    await _register_and_login(async_client)
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    # Place an order first
    await async_client.post("/api/v1/orders", json=payload)

    response = await async_client.get("/api/v1/orders/my")

    assert response.status_code == 200
    orders = response.json()
    assert len(orders) == 1
    assert orders[0]["customer_name"] == "Test Customer"


@pytest.mark.asyncio
async def test_get_my_orders_unauthenticated(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """GET /orders/my without auth cookie → 401 NOT_AUTHENTICATED."""
    response = await async_client.get("/api/v1/orders/my")

    assert response.status_code == 401
    assert response.json()["code"] == "NOT_AUTHENTICATED"
