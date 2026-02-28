# API Contract: Users

**Prefix**: `/api/v1/users`
**Resource**: User

---

## POST /api/v1/users — Create User

### Request

```
POST /api/v1/users
Content-Type: application/json
```

**Body**:
```json
{
  "full_name": "Fatima Khan",
  "email": "fatima@example.com"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| full_name | string | yes | non-empty, max 150 chars |
| email | string | yes | valid email format, unique (case-insensitive) |

### Responses

**201 Created**
```json
{
  "id": 1,
  "full_name": "Fatima Khan",
  "email": "fatima@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**422 Unprocessable Entity** — missing field
```json
{
  "detail": "Field 'email' is required",
  "code": "VALIDATION_ERROR"
}
```

**422 Unprocessable Entity** — invalid email format
```json
{
  "detail": "Invalid email address",
  "code": "VALIDATION_ERROR"
}
```

**409 Conflict** — email already exists
```json
{
  "detail": "A user with this email already exists",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

---

## GET /api/v1/users — List All Users

### Request

```
GET /api/v1/users
```

### Responses

**200 OK**
```json
[
  {
    "id": 1,
    "full_name": "Fatima Khan",
    "email": "fatima@example.com",
    "created_at": "2026-02-28T10:00:00Z"
  }
]
```

> Returns `[]` when no users exist. Never returns 404 for empty list.

---

## GET /api/v1/users/{id} — Get User by ID

### Request

```
GET /api/v1/users/1
```

### Responses

**200 OK**
```json
{
  "id": 1,
  "full_name": "Fatima Khan",
  "email": "fatima@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**404 Not Found**
```json
{
  "detail": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

## PUT /api/v1/users/{id} — Update User

### Request

```
PUT /api/v1/users/1
Content-Type: application/json
```

**Body** — all fields optional, at least one required:
```json
{
  "full_name": "Fatima A. Khan"
}
```

### Responses

**200 OK**
```json
{
  "id": 1,
  "full_name": "Fatima A. Khan",
  "email": "fatima@example.com",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**404 Not Found**
```json
{
  "detail": "User not found",
  "code": "USER_NOT_FOUND"
}
```

**409 Conflict** — email changed to one that already exists
```json
{
  "detail": "A user with this email already exists",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

**422 Unprocessable Entity** — invalid email format on update
```json
{
  "detail": "Invalid email address",
  "code": "VALIDATION_ERROR"
}
```

---

## DELETE /api/v1/users/{id} — Delete User

### Request

```
DELETE /api/v1/users/1
```

### Responses

**204 No Content** — user deleted, no body

**404 Not Found**
```json
{
  "detail": "User not found",
  "code": "USER_NOT_FOUND"
}
```
