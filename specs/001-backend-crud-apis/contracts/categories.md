# API Contract: Categories

**Prefix**: `/api/v1/categories`
**Resource**: Category

---

## POST /api/v1/categories — Create Category

### Request

```
POST /api/v1/categories
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Skincare",
  "description": "Moisturizers, serums, toners"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| name | string | yes | non-empty, max 100 chars, unique (case-insensitive) |
| description | string | no | max 500 chars, default `""` |

### Responses

**201 Created**
```json
{
  "id": 1,
  "name": "Skincare",
  "description": "Moisturizers, serums, toners",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**422 Unprocessable Entity** — name missing or empty
```json
{
  "detail": "Field 'name' is required",
  "code": "VALIDATION_ERROR"
}
```

**409 Conflict** — duplicate name
```json
{
  "detail": "A category with this name already exists",
  "code": "CATEGORY_ALREADY_EXISTS"
}
```

---

## GET /api/v1/categories — List All Categories

### Request

```
GET /api/v1/categories
```

### Responses

**200 OK**
```json
[
  {
    "id": 1,
    "name": "Skincare",
    "description": "Moisturizers, serums, toners",
    "created_at": "2026-02-28T10:00:00Z"
  }
]
```

> Returns `[]` when no categories exist. Never returns 404 for empty list.

---

## GET /api/v1/categories/{id} — Get Category by ID

### Request

```
GET /api/v1/categories/1
```

### Responses

**200 OK**
```json
{
  "id": 1,
  "name": "Skincare",
  "description": "Moisturizers, serums, toners",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**404 Not Found**
```json
{
  "detail": "Category not found",
  "code": "CATEGORY_NOT_FOUND"
}
```

---

## PUT /api/v1/categories/{id} — Update Category

### Request

```
PUT /api/v1/categories/1
Content-Type: application/json
```

**Body** — all fields optional, at least one required:
```json
{
  "description": "Face care products including serums and moisturizers"
}
```

### Responses

**200 OK**
```json
{
  "id": 1,
  "name": "Skincare",
  "description": "Face care products including serums and moisturizers",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**404 Not Found**
```json
{
  "detail": "Category not found",
  "code": "CATEGORY_NOT_FOUND"
}
```

**409 Conflict** — name changed to an existing name
```json
{
  "detail": "A category with this name already exists",
  "code": "CATEGORY_ALREADY_EXISTS"
}
```

---

## DELETE /api/v1/categories/{id} — Delete Category

### Request

```
DELETE /api/v1/categories/1
```

### Responses

**204 No Content** — category deleted, no body

**404 Not Found**
```json
{
  "detail": "Category not found",
  "code": "CATEGORY_NOT_FOUND"
}
```
