# API Contracts: Authentication (003-auth)

**Base path**: `/api/v1/auth`
**Date**: 2026-02-28

---

## Shared Response Schema

### UserRead
```json
{
  "id": 1,
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

### ErrorResponse
```json
{
  "detail": "Human-readable message",
  "code": "SCREAMING_SNAKE_CODE"
}
```

---

## POST /api/v1/auth/register

**Purpose**: Create a new user account and immediately log in.

### Request
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "password": "securepassword123"
}
```

**Validation**:
- `full_name`: required, 1–150 chars (after strip)
- `email`: required, valid email format, normalized to lowercase
- `password`: required, minimum 8 characters

### Response — 201 Created
```
Set-Cookie: access_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800
Set-Cookie: refresh_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800

{
  "id": 1,
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 422 | _(Pydantic detail)_ | Validation failure (bad email, short password, missing field) |

---

## POST /api/v1/auth/login

**Purpose**: Authenticate with email and password; receive session cookies.

### Request
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "aisha@example.com",
  "password": "securepassword123"
}
```

### Response — 200 OK
```
Set-Cookie: access_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800
Set-Cookie: refresh_token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800

{
  "id": 1,
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `INVALID_CREDENTIALS` | Wrong password OR email not found (same response — no enumeration) |
| 422 | _(Pydantic detail)_ | Missing fields or invalid email format |

---

## POST /api/v1/auth/logout

**Purpose**: End the current session by clearing auth cookies.

### Request
```
POST /api/v1/auth/logout
Cookie: access_token=<jwt>; refresh_token=<jwt>
```
_(No request body)_

### Response — 204 No Content
```
Set-Cookie: access_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
Set-Cookie: refresh_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
```
_(No response body)_

**Idempotent**: Returns 204 even if cookies were not present — logout is always safe to call.

---

## POST /api/v1/auth/refresh

**Purpose**: Issue a new access token from a valid refresh token cookie.

### Request
```
POST /api/v1/auth/refresh
Cookie: refresh_token=<jwt>
```
_(No request body)_

### Response — 200 OK
```
Set-Cookie: access_token=<new_jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800

{
  "id": 1,
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**Note**: Only the `access_token` cookie is updated. The `refresh_token` cookie is not rotated (MVP phase — see research.md Decision 4).

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `INVALID_REFRESH_TOKEN` | Refresh token missing, expired, malformed, or wrong token type |

---

## GET /api/v1/auth/me

**Purpose**: Return the currently authenticated user's profile.

### Request
```
GET /api/v1/auth/me
Cookie: access_token=<jwt>
```

### Response — 200 OK
```json
{
  "id": 1,
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 401 | `NOT_AUTHENTICATED` | No access_token cookie present |
| 401 | `TOKEN_EXPIRED` | access_token is present but expired |
| 401 | `NOT_AUTHENTICATED` | Token is malformed or user no longer exists |

---

## Cookie Reference

| Cookie | Value | HttpOnly | SameSite | Max-Age |
|--------|-------|----------|----------|---------|
| `access_token` | signed JWT | Yes | Lax | 1800s (30 min) |
| `refresh_token` | signed JWT | Yes | Lax | 604800s (7 days) |

**`secure` flag**: `False` in development (localhost HTTP), `True` in production (HTTPS). Controlled by `ENVIRONMENT` setting.
