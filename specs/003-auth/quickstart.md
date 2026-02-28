# Quickstart & Integration Scenarios: Authentication (003-auth)

**Date**: 2026-02-28
**Branch**: `003-auth`

---

## Prerequisites

```bash
cd backend
# .env must have:
# JWT_SECRET=<random 32-byte hex>
# JWT_ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30
# REFRESH_TOKEN_EXPIRE_DAYS=7
# ENVIRONMENT=dev
uvicorn app.main:app --reload
```

---

## Scenario 1 — Register and Immediately Access Protected Endpoint

```bash
# Step 1: Register
curl -c cookies.txt -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Aisha Khan", "email": "aisha@example.com", "password": "securepass123"}'
# Expected: 201 {"id":1,"full_name":"Aisha Khan","email":"aisha@example.com","created_at":"..."}
# Cookies set: access_token, refresh_token

# Step 2: Access /me with cookies
curl -b cookies.txt http://localhost:8000/api/v1/auth/me
# Expected: 200 {"id":1,"full_name":"Aisha Khan","email":"aisha@example.com","created_at":"..."}
```

---

## Scenario 2 — Login with Existing Account

```bash
# Login
curl -c cookies.txt -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "aisha@example.com", "password": "securepass123"}'
# Expected: 200 {"id":1,...}

# Verify session
curl -b cookies.txt http://localhost:8000/api/v1/auth/me
# Expected: 200 {"id":1,...}
```

---

## Scenario 3 — Wrong Password Returns 401

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "aisha@example.com", "password": "wrongpassword"}'
# Expected: 401 {"detail":"Invalid credentials","code":"INVALID_CREDENTIALS"}
```

---

## Scenario 4 — Logout Clears Session

```bash
# Logout
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8000/api/v1/auth/logout
# Expected: 204 No Content, cookies cleared (max_age=0)

# /me now fails
curl -b cookies.txt http://localhost:8000/api/v1/auth/me
# Expected: 401 {"detail":"Not authenticated","code":"NOT_AUTHENTICATED"}
```

---

## Scenario 5 — Silent Token Refresh

```bash
# Simulate: access token expired but refresh token valid
# Call /refresh with refresh_token cookie
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8000/api/v1/auth/refresh
# Expected: 200 {"id":1,...}, new access_token cookie issued

# /me works again
curl -b cookies.txt http://localhost:8000/api/v1/auth/me
# Expected: 200 {"id":1,...}
```

---

## Scenario 6 — Duplicate Email Registration

```bash
# First registration (success)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Aisha Khan", "email": "aisha@example.com", "password": "securepass123"}'
# Expected: 201

# Same email again (conflict)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Aisha Khan 2", "email": "AISHA@example.com", "password": "anotherpass123"}'
# Expected: 409 {"detail":"A user with this email already exists","code":"EMAIL_ALREADY_EXISTS"}
# Note: email casing is normalized — AISHA@example.com == aisha@example.com
```

---

## Scenario 7 — Short Password Validation

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Test", "email": "test@example.com", "password": "short"}'
# Expected: 422 Unprocessable Entity (Pydantic validation error)
```

---

## Running Auth Tests

```bash
cd backend
pytest app/auth/tests/ -v
# Expected: all tests pass, covering all 7 scenarios above
```

---

## Using /docs

Visit `http://localhost:8000/docs` — all 5 auth endpoints are listed under the `auth` tag.
Note: Swagger UI uses Authorization headers for Bearer tokens, not cookies. Use curl or the frontend for cookie-based auth testing.
