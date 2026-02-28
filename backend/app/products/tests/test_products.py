import pytest
import httpx


@pytest.fixture
async def category_id(async_client: httpx.AsyncClient) -> int:
    response = await async_client.post(
        "/api/v1/categories",
        json={"name": "Skincare"},
    )
    return response.json()["id"]


async def test_create_product_success(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    response = await async_client.post(
        "/api/v1/products",
        json={
            "name": "Vitamin C Serum",
            "description": "Brightening serum",
            "price": 29.99,
            "stock": 100,
            "category_id": category_id,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Vitamin C Serum"
    assert data["price"] == 29.99
    assert data["stock"] == 100
    assert data["category_id"] == category_id
    assert "created_at" in data


async def test_list_products_empty(async_client: httpx.AsyncClient) -> None:
    response = await async_client.get("/api/v1/products")
    assert response.status_code == 200
    assert response.json() == []


async def test_list_products_returns_all(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": 10.0, "stock": 5, "category_id": category_id},
    )
    await async_client.post(
        "/api/v1/products",
        json={"name": "Toner", "price": 15.0, "stock": 10, "category_id": category_id},
    )
    response = await async_client.get("/api/v1/products")
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_product_success(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": 10.0, "stock": 5, "category_id": category_id},
    )
    response = await async_client.get("/api/v1/products/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Serum"


async def test_get_product_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.get("/api/v1/products/999")
    assert response.status_code == 404
    assert response.json()["code"] == "PRODUCT_NOT_FOUND"


async def test_update_product_success(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": 29.99, "stock": 100, "category_id": category_id},
    )
    response = await async_client.put(
        "/api/v1/products/1",
        json={"price": 24.99, "stock": 80},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 24.99
    assert data["stock"] == 80
    assert data["name"] == "Serum"


async def test_update_product_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.put(
        "/api/v1/products/999",
        json={"price": 10.0},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "PRODUCT_NOT_FOUND"


async def test_delete_product_success(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": 10.0, "stock": 5, "category_id": category_id},
    )
    response = await async_client.delete("/api/v1/products/1")
    assert response.status_code == 204
    get_response = await async_client.get("/api/v1/products/1")
    assert get_response.status_code == 404


async def test_delete_product_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.delete("/api/v1/products/999")
    assert response.status_code == 404
    assert response.json()["code"] == "PRODUCT_NOT_FOUND"


async def test_create_product_invalid_category(
    async_client: httpx.AsyncClient,
) -> None:
    response = await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": 10.0, "stock": 5, "category_id": 999},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "CATEGORY_NOT_FOUND"


async def test_create_product_negative_price(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    response = await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": -5.0, "stock": 10, "category_id": category_id},
    )
    assert response.status_code == 422


async def test_create_product_missing_name(
    async_client: httpx.AsyncClient, category_id: int
) -> None:
    response = await async_client.post(
        "/api/v1/products",
        json={"price": 10.0, "stock": 5, "category_id": category_id},
    )
    assert response.status_code == 422
