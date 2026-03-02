from unittest.mock import AsyncMock, patch

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories import service as category_service
from app.categories.schemas import CategoryCreate
from app.products import service as product_service
from app.products.schemas import ProductCreate


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
        "email": "order@test.com",
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


async def _register_and_login_admin(async_client: httpx.AsyncClient) -> None:
    """Register + login as the admin user (ADMIN_EMAIL)."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Admin",
            "email": "info.irhapk0@gmail.com",
            "password": "Password1!",
        },
    )
    await async_client.post(
        "/api/v1/auth/login",
        json={"email": "info.irhapk0@gmail.com", "password": "Password1!"},
    )


# Convenience context manager: patch both order-creation email sends
def _mock_order_emails():
    return (
        patch(
            "app.orders.service.email_service.send_admin_order_notification",
            new_callable=AsyncMock,
        ),
        patch(
            "app.orders.service.email_service.send_customer_order_confirmation",
            new_callable=AsyncMock,
        ),
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_order_guest(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """POST /orders without auth cookie → 401 (orders require login)."""
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    response = await async_client.post("/api/v1/orders", json=payload)

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_order_authenticated(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """POST /orders with valid auth cookie → 201, order linked to user."""
    await _register_and_login(async_client)
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    mock_admin, mock_customer = _mock_order_emails()
    with mock_admin, mock_customer:
        response = await async_client.post("/api/v1/orders", json=payload)

    assert response.status_code == 201
    body = response.json()
    assert body["user_id"] is not None
    assert body["customer_name"] == "Test Customer"


@pytest.mark.asyncio
async def test_create_order_sends_both_emails(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """POST /orders → both admin notification and customer confirmation are sent."""
    await _register_and_login(async_client)
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    mock_admin_patch, mock_customer_patch = _mock_order_emails()
    with mock_admin_patch as mock_admin, mock_customer_patch as mock_customer:
        response = await async_client.post("/api/v1/orders", json=payload)

    assert response.status_code == 201
    mock_admin.assert_called_once()
    mock_customer.assert_called_once()


@pytest.mark.asyncio
async def test_get_my_orders_authenticated(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """GET /orders/my with valid auth → 200, returns user's orders."""
    await _register_and_login(async_client)
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    mock_admin, mock_customer = _mock_order_emails()
    with mock_admin, mock_customer:
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


@pytest.mark.asyncio
async def test_update_order_status_sends_email(
    async_client: httpx.AsyncClient, db_session: AsyncSession
) -> None:
    """PATCH /orders/{id}/status → send_order_status_update is called."""
    # Create order as regular user
    await _register_and_login(async_client)
    product = await _seed_product(db_session)
    payload = _order_payload(product["product_id"], product["unit_price"])

    mock_admin, mock_customer = _mock_order_emails()
    with mock_admin, mock_customer:
        create_resp = await async_client.post("/api/v1/orders", json=payload)
    order_id = create_resp.json()["id"]

    # Logout regular user, login as admin
    await async_client.post("/api/v1/auth/logout")
    await _register_and_login_admin(async_client)

    with patch(
        "app.orders.service.email_service.send_order_status_update",
        new_callable=AsyncMock,
    ) as mock_status:
        response = await async_client.patch(
            f"/api/v1/orders/{order_id}/status",
            json={"status": "processing"},
        )

    assert response.status_code == 200
    assert response.json()["status"] == "processing"
    mock_status.assert_called_once()
