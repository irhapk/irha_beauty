# API Contract: Products

**Prefix**: `/api/v1/products`
**Resource**: Product

---

## POST /api/v1/products — Create Product

### Request

```
POST /api/v1/products
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Vitamin C Serum",
  "description": "Brightening serum with 15% Vitamin C",
  "price": 29.99,
  "stock": 100,
  "category_id": 1
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| name | string | yes | non-empty, max 200 chars |
| description | string | no | max 2000 chars, default `""` |
| price | float | yes | >= 0.0 |
| stock | integer | yes | >= 0 |
| category_id | integer | yes | must be a valid category ID |

### Responses

**201 Created**
```json
{
  "id": 1,
  "name": "Vitamin C Serum",
  "description": "Brightening serum with 15% Vitamin C",
  "price": 29.99,
  "stock": 100,
  "category_id": 1,
  "created_at": "2026-02-28T10:00:00Z"
}
```

**422 Unprocessable Entity** — missing/invalid field
```json
{
  "detail": "Field 'name' is required",
  "code": "VALIDATION_ERROR"
}
```

**422 Unprocessable Entity** — negative price
```json
{
  "detail": "Price must be >= 0",
  "code": "VALIDATION_ERROR"
}
```

**404 Not Found** — category_id does not exist
```json
{
  "detail": "Category not found",
  "code": "CATEGORY_NOT_FOUND"
}
```

---

## GET /api/v1/products — List All Products

### Request

```
GET /api/v1/products
```

### Responses

**200 OK**
```json
[
  {
    "id": 1,
    "name": "Vitamin C Serum",
    "description": "Brightening serum",
    "price": 29.99,
    "stock": 100,
    "category_id": 1,
    "created_at": "2026-02-28T10:00:00Z"
  }
]
```

> Returns `[]` when no products exist. Never returns 404 for empty list.

---

## GET /api/v1/products/{id} — Get Product by ID

### Request

```
GET /api/v1/products/1
```

| Path Param | Type | Required |
|---|---|---|
| id | integer | yes |

### Responses

**200 OK**
```json
{
  "id": 1,
  "name": "Vitamin C Serum",
  "description": "Brightening serum",
  "price": 29.99,
  "stock": 100,
  "category_id": 1,
  "created_at": "2026-02-28T10:00:00Z"
}
```

**404 Not Found**
```json
{
  "detail": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

**422 Unprocessable Entity** — id not an integer
```json
{
  "detail": "ID must be a valid integer",
  "code": "VALIDATION_ERROR"
}
```

---

## PUT /api/v1/products/{id} — Update Product

### Request

```
PUT /api/v1/products/1
Content-Type: application/json
```

**Body** — all fields optional, at least one required:
```json
{
  "price": 24.99,
  "stock": 80
}
```

### Responses

**200 OK** — returns full updated product
```json
{
  "id": 1,
  "name": "Vitamin C Serum",
  "description": "Brightening serum",
  "price": 24.99,
  "stock": 80,
  "category_id": 1,
  "created_at": "2026-02-28T10:00:00Z"
}
```

**404 Not Found**
```json
{
  "detail": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

**422 Unprocessable Entity** — invalid field value
```json
{
  "detail": "Price must be >= 0",
  "code": "VALIDATION_ERROR"
}
```

---

## DELETE /api/v1/products/{id} — Delete Product

### Request

```
DELETE /api/v1/products/1
```

### Responses

**204 No Content** — product deleted, no body

**404 Not Found**
```json
{
  "detail": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```
