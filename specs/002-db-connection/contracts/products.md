# API Contract: Products

**Phase 2 Note**: All contracts are identical to Phase 1. Phase 2 only changes the storage layer. No endpoint paths, request shapes, response shapes, or status codes change.

---

## POST /api/v1/products

**Purpose**: Create a new product.

**Request body**:
```json
{
  "name": "string (required)",
  "description": "string (optional, default '')",
  "price": "number >= 0 (required)",
  "stock": "integer >= 0 (required)",
  "category_id": "integer (required)"
}
```

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 201 | `ProductRead` | Created successfully |
| 404 | `{ "detail": "...", "code": "CATEGORY_NOT_FOUND" }` | `category_id` does not exist |
| 422 | Validation error | Missing required fields, negative price, negative stock, non-integer `category_id` |

---

## GET /api/v1/products

**Purpose**: List all products.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `list[ProductRead]` | Always (empty list `[]` if none) |

---

## GET /api/v1/products/{id}

**Purpose**: Get a single product by ID.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `ProductRead` | Found |
| 404 | `{ "detail": "...", "code": "PRODUCT_NOT_FOUND" }` | ID does not exist |
| 422 | Validation error | `{id}` is not an integer |

---

## PUT /api/v1/products/{id}

**Purpose**: Update a product (partial update — all fields optional).

**Request body**:
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "price": "number >= 0 (optional)",
  "stock": "integer >= 0 (optional)",
  "category_id": "integer (optional)"
}
```

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 200 | `ProductRead` | Updated successfully |
| 404 | `{ "detail": "...", "code": "PRODUCT_NOT_FOUND" }` | Product ID does not exist |
| 404 | `{ "detail": "...", "code": "CATEGORY_NOT_FOUND" }` | New `category_id` does not exist |
| 422 | Validation error | Non-integer `{id}`, negative price, negative stock |

---

## DELETE /api/v1/products/{id}

**Purpose**: Delete a product.

**Responses**:
| Status | Body | Condition |
|---|---|---|
| 204 | (no body) | Deleted successfully |
| 404 | `{ "detail": "...", "code": "PRODUCT_NOT_FOUND" }` | ID does not exist |
| 422 | Validation error | `{id}` is not an integer |

---

## ProductRead schema

```json
{
  "id": 1,
  "name": "Rose Water Toner",
  "description": "Hydrating toner with rose extract",
  "price": 12.99,
  "stock": 50,
  "category_id": 1,
  "created_at": "2026-02-28T12:00:00Z"
}
```
