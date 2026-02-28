import pytest
import httpx


# ---------------------------------------------------------------------------
# Phase 3: US1 — Register
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_register_success(async_client: httpx.AsyncClient):
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Aisha Khan", "email": "aisha@example.com", "password": "securepass123"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "aisha@example.com"
    assert body["full_name"] == "Aisha Khan"
    assert "id" in body
    assert "created_at" in body
    # Cookies must be set
    assert "access_token" in resp.cookies
    assert "refresh_token" in resp.cookies


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: httpx.AsyncClient):
    payload = {"full_name": "Test User", "email": "dup@example.com", "password": "securepass123"}
    r1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = await async_client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409
    assert r2.json()["code"] == "EMAIL_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_register_short_password(async_client: httpx.AsyncClient):
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test", "email": "short@example.com", "password": "short"},
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(async_client: httpx.AsyncClient):
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test", "email": "not-an-email", "password": "securepass123"},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Phase 4: US2 — Login
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_login_success(async_client: httpx.AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Login User", "email": "login@example.com", "password": "mypassword1"},
    )
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "mypassword1"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "login@example.com"
    assert "access_token" in resp.cookies
    assert "refresh_token" in resp.cookies


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: httpx.AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Wrong PW", "email": "wrongpw@example.com", "password": "correctpass1"},
    )
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpw@example.com", "password": "wrongpassword"},
    )
    assert resp.status_code == 401
    assert resp.json()["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_unknown_email(async_client: httpx.AsyncClient):
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "somepassword"},
    )
    assert resp.status_code == 401
    assert resp.json()["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_email_case_insensitive(async_client: httpx.AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Case Test", "email": "UPPER@example.com", "password": "mypassword1"},
    )
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "upper@example.com", "password": "mypassword1"},
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "upper@example.com"


# ---------------------------------------------------------------------------
# Phase 5: US3 — Logout
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_logout(async_client: httpx.AsyncClient):
    # Register + login (sets cookies on the client)
    await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Logout User", "email": "logout@example.com", "password": "mypassword1"},
    )
    # Logout
    resp_logout = await async_client.post("/api/v1/auth/logout")
    assert resp_logout.status_code == 204
    # Clear cookies from the client jar to simulate browser deleting them
    async_client.cookies.clear()
    # /me should now return 401
    resp_me = await async_client.get("/api/v1/auth/me")
    assert resp_me.status_code == 401
    assert resp_me.json()["code"] == "NOT_AUTHENTICATED"


# ---------------------------------------------------------------------------
# Phase 6: US4 — Refresh + Me
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_me_authenticated(async_client: httpx.AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Me User", "email": "me@example.com", "password": "mypassword1"},
    )
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_me_unauthenticated(async_client: httpx.AsyncClient):
    resp = await async_client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    assert resp.json()["code"] == "NOT_AUTHENTICATED"


@pytest.mark.asyncio
async def test_refresh_success(async_client: httpx.AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"full_name": "Refresh User", "email": "refresh@example.com", "password": "mypassword1"},
    )
    resp = await async_client.post("/api/v1/auth/refresh")
    assert resp.status_code == 200
    assert resp.json()["email"] == "refresh@example.com"
    assert "access_token" in resp.cookies


@pytest.mark.asyncio
async def test_refresh_invalid_token(async_client: httpx.AsyncClient):
    # No cookies set — no refresh_token
    resp = await async_client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401
    assert resp.json()["code"] == "INVALID_REFRESH_TOKEN"
