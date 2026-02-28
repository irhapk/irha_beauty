# Data Model: Backend CRUD APIs — Phase 1

**Date**: 2026-02-28
**Feature**: 001-backend-crud-apis

> Phase 1 uses in-memory storage. These models define the shape of the data and validation rules. In Phase 2 they become SQLAlchemy ORM models.

---

## Entity 1: Product

### Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| `id` | int | system-assigned | Auto-increment, starts at 1, never from client |
| `name` | str | yes | Non-empty, max 200 chars |
| `description` | str | no | Max 2000 chars, defaults to `""` |
| `price` | float | yes | >= 0.0 (zero allowed for free items) |
| `stock` | int | yes | >= 0 |
| `category_id` | int | yes | Must reference an existing category ID |
| `created_at` | datetime | system-assigned | Set on creation, ISO 8601 |

### Schemas

| Schema | Purpose | Fields |
|---|---|---|
| `ProductCreate` | POST body | name, description, price, stock, category_id |
| `ProductUpdate` | PUT body | all fields optional |
| `ProductRead` | Response | all fields including id, created_at |

### Relationships

- `category_id` references a `Category`. In Phase 1, validated by checking in-memory category store.

### Validation Rules (enforced at schema level)

- `name` must not be empty or whitespace-only
- `price` must be `>= 0`
- `stock` must be `>= 0` and integer
- `category_id` must exist in the categories store (service-level check → 404 if not found)

---

## Entity 2: Category

### Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| `id` | int | system-assigned | Auto-increment, starts at 1 |
| `name` | str | yes | Non-empty, max 100 chars, **unique** |
| `description` | str | no | Max 500 chars, defaults to `""` |
| `created_at` | datetime | system-assigned | Set on creation, ISO 8601 |

### Schemas

| Schema | Purpose | Fields |
|---|---|---|
| `CategoryCreate` | POST body | name, description |
| `CategoryUpdate` | PUT body | all fields optional |
| `CategoryRead` | Response | all fields including id, created_at |

### Uniqueness Constraint

- `name` is unique (case-insensitive check). Duplicate → 409 `CATEGORY_ALREADY_EXISTS`.

### Validation Rules

- `name` must not be empty or whitespace-only
- Uniqueness checked at service level before inserting

---

## Entity 3: User

### Fields

| Field | Type | Required | Validation Rules |
|---|---|---|---|
| `id` | int | system-assigned | Auto-increment, starts at 1 |
| `full_name` | str | yes | Non-empty, max 150 chars |
| `email` | str | yes | Valid email format, **unique** |
| `created_at` | datetime | system-assigned | Set on creation, ISO 8601 |

### Schemas

| Schema | Purpose | Fields |
|---|---|---|
| `UserCreate` | POST body | full_name, email |
| `UserUpdate` | PUT body | all fields optional |
| `UserRead` | Response | all fields including id, created_at |

### Uniqueness Constraint

- `email` is unique (case-insensitive). Duplicate → 409 `EMAIL_ALREADY_EXISTS`.

### Validation Rules

- `full_name` must not be empty
- `email` must pass Pydantic `EmailStr` format validation
- Uniqueness checked at service level before inserting

---

## In-Memory Storage Shape (Phase 1)

Each service module holds:

```python
# Example: products/service.py
_store: dict[int, ProductRead] = {}
_counter: int = 0
```

- `_store`: maps ID → entity
- `_counter`: current max ID; incremented on each create
- Cleared between test runs via fixture reset

---

## Entity Relationship Summary

```
Category (1) ──── (many) Product
User            (standalone in Phase 1)
```

- A Product must belong to exactly one Category.
- A User has no relationships in Phase 1.
