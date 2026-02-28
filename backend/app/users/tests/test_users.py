import httpx


async def test_create_user_success(async_client: httpx.AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "fatima@example.com"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["full_name"] == "Fatima Khan"
    assert data["email"] == "fatima@example.com"
    assert "created_at" in data


async def test_list_users_empty(async_client: httpx.AsyncClient) -> None:
    response = await async_client.get("/api/v1/users")
    assert response.status_code == 200
    assert response.json() == []


async def test_list_users_returns_all(async_client: httpx.AsyncClient) -> None:
    await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "fatima@example.com"},
    )
    await async_client.post(
        "/api/v1/users",
        json={"full_name": "Sara Ali", "email": "sara@example.com"},
    )
    response = await async_client.get("/api/v1/users")
    assert response.status_code == 200
    assert len(response.json()) == 2


async def test_get_user_success(async_client: httpx.AsyncClient) -> None:
    await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "fatima@example.com"},
    )
    response = await async_client.get("/api/v1/users/1")
    assert response.status_code == 200
    assert response.json()["full_name"] == "Fatima Khan"


async def test_get_user_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.get("/api/v1/users/999")
    assert response.status_code == 404
    assert response.json()["code"] == "USER_NOT_FOUND"


async def test_update_user_success(async_client: httpx.AsyncClient) -> None:
    await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "fatima@example.com"},
    )
    response = await async_client.put(
        "/api/v1/users/1",
        json={"full_name": "Fatima A. Khan"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Fatima A. Khan"
    assert data["email"] == "fatima@example.com"


async def test_update_user_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.put(
        "/api/v1/users/999",
        json={"full_name": "Nobody"},
    )
    assert response.status_code == 404
    assert response.json()["code"] == "USER_NOT_FOUND"


async def test_delete_user_success(async_client: httpx.AsyncClient) -> None:
    await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "fatima@example.com"},
    )
    response = await async_client.delete("/api/v1/users/1")
    assert response.status_code == 204
    get_response = await async_client.get("/api/v1/users/1")
    assert get_response.status_code == 404


async def test_delete_user_not_found(async_client: httpx.AsyncClient) -> None:
    response = await async_client.delete("/api/v1/users/999")
    assert response.status_code == 404
    assert response.json()["code"] == "USER_NOT_FOUND"


async def test_create_user_duplicate_email(async_client: httpx.AsyncClient) -> None:
    await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "fatima@example.com"},
    )
    response = await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Two", "email": "fatima@example.com"},
    )
    assert response.status_code == 409
    assert response.json()["code"] == "EMAIL_ALREADY_EXISTS"


async def test_create_user_invalid_email(async_client: httpx.AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/users",
        json={"full_name": "Fatima Khan", "email": "not-an-email"},
    )
    assert response.status_code == 422


async def test_create_user_missing_name(async_client: httpx.AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/users",
        json={"email": "fatima@example.com"},
    )
    assert response.status_code == 422
