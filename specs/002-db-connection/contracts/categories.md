# API Contract: Categories

**Phase 2 Note**: All contracts are identical to Phase 1. Phase 2 only changes the storage layer. No endpoint paths, request shapes, response shapes, or status codes change.

**New in Phase 2**: `DELETE /{id}` now returns `409 CATEGORY_HAS_PRODUCTS` if the category has associated products. This is additive — no existing Phase 1 test covers this case.

---

## POST /api/v1/categories

**Purpose**: Create a new category.

**Request body**:
```json
{ "name": "string (required)", "description": "string (optional, default '')" }
```

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 201 | `CategoryRead` | Created successfully |
| 409 | `{ "detail": "...", "code": "CATEGORY_ALREADY_EXISTS" }` | Name already exists (case-insensitive) |
| 422 | Validation error | Missing name, empty name, name > 100 chars, description > 500 chars |

---

## GET /api/v1/categories

**Purpose**: List all categories.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `list[CategoryRead]` | Always (empty list `[]` if none) |

---

## GET /api/v1/categories/{id}

**Purpose**: Get a single category by ID.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `CategoryRead` | Found |
| 404 | `{ "detail": "...", "code": "CATEGORY_NOT_FOUND" }` | ID does not exist |
| 422 | Validation error | `{id}` is not an integer |

---

## PUT /api/v1/categories/{id}

**Purpose**: Update a category (partial update — all fields optional).

**Request body**:
```json
{ "name": "string (optional)", "description": "string (optional)" }
```

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `CategoryRead` | Updated successfully |
| 404 | `{ "detail": "...", "code": "CATEGORY_NOT_FOUND" }` | ID does not exist |
| 409 | `{ "detail": "...", "code": "CATEGORY_ALREADY_EXISTS" }` | New name conflicts with existing category |
| 422 | Validation error | Non-integer `{id}`, empty name, name > 100 chars |

---

## DELETE /api/v1/categories/{id}

**Purpose**: Delete a category.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 204 | (no body) | Deleted successfully |
| 404 | `{ "detail": "...", "code": "CATEGORY_NOT_FOUND" }` | ID does not exist |
| 409 | `{ "detail": "...", "code": "CATEGORY_HAS_PRODUCTS" }` | **NEW in Phase 2** — Category has products |
| 422 | Validation error | `{id}` is not an integer |

---

## CategoryRead schema

```json
{
  "id": 1,
  "name": "Skincare",
  "description": "Face and body skincare products",
  "created_at": "2026-02-28T12:00:00Z"
}
```
