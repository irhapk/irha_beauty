import httpx


async def test_create_category_success(async_client: httpx.AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/categories",
        json={"name": "Skincare", "description": "Face care products"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["name"] == "Skincare"
    assert data["description"] == "Face care products"
    assert "created_at" in data


async def test_list_categories_empty(async_client: httpx.AsyncClient) -> None:
    response = await async_client.get("/api/v1/categories")
    assert response.status_code == 200
    assert response.json() == []


async def test_list_categories_returns_all(async_client: httpx.AsyncClient) -> None:
    await async_client.post("/api/v1/categories", json={"name": "Skincare"})
    await async_client.post("/api/v1/categories", json={"name": "Haircare"})
    response = await async_client.get("/api/v1/categories")
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_category_success(async_client: httpx.AsyncClient) -> None:
    await async_client.post("/api/v1/categories", json={"name": "Makeup"})
    response = await async_client.get("/api/v1/categories/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Makeup"


async def test_get_category_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.get("/api/v1/categories/999")
    assert response.status_code == 404
    assert response.json()["code"] == "CATEGORY_NOT_FOUND"


async def test_update_category_success(async_client: httpx.AsyncClient) -> None:
    await async_client.post("/api/v1/categories", json={"name": "Skincare"})
    response = await async_client.put(
        "/api/v1/categories/1",
        json={"description": "Updated description"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Skincare"
    assert data["description"] == "Updated description"


async def test_update_category_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.put(
        "/api/v1/categories/999",
        json={"description": "Does not matter"},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "CATEGORY_NOT_FOUND"


async def test_delete_category_success(async_client: httpx.AsyncClient) -> None:
    await async_client.post("/api/v1/categories", json={"name": "Skincare"})
    response = await async_client.delete("/api/v1/categories/1")
    assert response.status_code == 204
    get_response = await async_client.get("/api/v1/categories/1")
    assert get_response.status_code == 404


async def test_delete_category_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.delete("/api/v1/categories/999")
    assert response.status_code == 404
    assert response.json()["code"] == "CATEGORY_NOT_FOUND"


async def test_create_category_duplicate_name(async_client: httpx.AsyncClient) -> None:
    await async_client.post("/api/v1/categories", json={"name": "Skincare"})
    response = await async_client.post("/api/v1/categories", json={"name": "Skincare"})
    assert response.status_code == 409
    assert response.json()["code"] == "CATEGORY_ALREADY_EXISTS"


async def test_create_category_missing_name(async_client: httpx.AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/categories",
        json={"description": "No name provided"},
    )
    assert response.status_code == 422


async def test_delete_category_with_products(async_client: httpx.AsyncClient) -> None:
    # Create a category
    cat_resp = await async_client.post("/api/v1/categories", json={"name": "Skincare"})
    category_id = cat_resp.json()["id"]

    # Create a product in that category
    prod_resp = await async_client.post(
        "/api/v1/products",
        json={"name": "Serum", "price": 15.0, "stock": 10, "category_id": category_id},
    )
    product_id = prod_resp.json()["id"]

    # Attempt to delete the category — must be blocked
    response = await async_client.delete(f"/api/v1/categories/{category_id}")
    assert response.status_code == 409
    assert response.json()["code"] == "CATEGORY_HAS_PRODUCTS"

    # Delete the product first
    await async_client.delete(f"/api/v1/products/{product_id}")

    # Now category deletion must succeed
    response = await async_client.delete(f"/api/v1/categories/{category_id}")
    assert response.status_code == 204
