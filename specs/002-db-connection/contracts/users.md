# API Contract: Users

**Phase 2 Note**: All contracts are identical to Phase 1. Phase 2 only changes the storage layer. No endpoint paths, request shapes, response shapes, or status codes change.

---

## POST /api/v1/users

**Purpose**: Create a new user.

**Request body**:
```json
{ "full_name": "string (required)", "email": "valid email (required)" }
```

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 201 | `UserRead` | Created successfully |
| 409 | `{ "detail": "...", "code": "EMAIL_ALREADY_EXISTS" }` | Email already registered (case-insensitive) |
| 422 | Validation error | Missing `full_name`, invalid email format, empty `full_name` |

---

## GET /api/v1/users

**Purpose**: List all users.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `list[UserRead]` | Always (empty list `[]` if none) |

---

## GET /api/v1/users/{id}

**Purpose**: Get a single user by ID.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `UserRead` | Found |
| 404 | `{ "detail": "...", "code": "USER_NOT_FOUND" }` | ID does not exist |
| 422 | Validation error | `{id}` is not an integer |

---

## PUT /api/v1/users/{id}

**Purpose**: Update a user (partial update — all fields optional).

**Request body**:
```json
{ "full_name": "string (optional)", "email": "valid email (optional)" }
```

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `UserRead` | Updated successfully |
| 404 | `{ "detail": "...", "code": "USER_NOT_FOUND" }` | ID does not exist |
| 409 | `{ "detail": "...", "code": "EMAIL_ALREADY_EXISTS" }` | New email conflicts with existing user |
| 422 | Validation error | Non-integer `{id}`, invalid email format |

---

## DELETE /api/v1/users/{id}

**Purpose**: Delete a user.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 204 | (no body) | Deleted successfully |
| 404 | `{ "detail": "...", "code": "USER_NOT_FOUND" }` | ID does not exist |
| 422 | Validation error | `{id}` is not an integer |

---

## UserRead schema

```json
{
  "id": 1,
  "full_name": "Fatima Khan",
  "email": "fatima@example.com",
  "created_at": "2026-02-28T12:00:00Z"
}
```
