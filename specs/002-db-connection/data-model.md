# Data Model: Database Connection — Phase 2

**Feature**: 002-db-connection
**Date**: 2026-02-28
**Source**: spec.md entities + Phase 1 schemas (unchanged contracts)

---

## Overview

Three entities are persisted to PostgreSQL. The schema maps exactly to the existing Phase 1 Pydantic schemas — no field names, types, or validation rules change. All auto-generated fields (`id`, `created_at`) are now set by the database, not the application.

---

## Entity: Category

**Table**: `categories`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY`, auto-increment | Auto-assigned by DB |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Case-insensitive uniqueness enforced at application layer; DB unique index ensures storage-level enforcement |
| `description` | `TEXT` | `NOT NULL`, `DEFAULT ''` | Empty string default matches Phase 1 behaviour |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Set by DB server |

**Relationships**:
- Has many `Product` (one-to-many via `products.category_id`)

**Constraints**:
- `UNIQUE (name)` — DB-level uniqueness
- Delete behaviour: **RESTRICT** — cannot delete a category if any products reference it

**Application-level validation** (unchanged from Phase 1):
- `name`: required, non-empty after strip, max 100 chars
- `description`: optional (defaults to `""`), max 500 chars

---

## Entity: Product

**Table**: `products`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY`, auto-increment | Auto-assigned by DB |
| `name` | `VARCHAR(200)` | `NOT NULL` | |
| `description` | `TEXT` | `NOT NULL`, `DEFAULT ''` | Empty string default |
| `price` | `NUMERIC(10, 2)` | `NOT NULL`, `CHECK (price >= 0)` | Stored as decimal; Pydantic coerces to `float` |
| `stock` | `INTEGER` | `NOT NULL`, `CHECK (stock >= 0)`, `DEFAULT 0` | |
| `category_id` | `INTEGER` | `NOT NULL`, `FK → categories.id ON DELETE RESTRICT` | |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Set by DB server |

**Relationships**:
- Belongs to one `Category` (via `category_id`)

**Constraints**:
- `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT`
- `CHECK (price >= 0)`
- `CHECK (stock >= 0)`

**Application-level validation** (unchanged from Phase 1):
- `name`: required, non-empty after strip, max 200 chars
- `description`: optional (defaults to `""`), max 2000 chars
- `price`: required, `>= 0`
- `stock`: required, `>= 0`
- `category_id`: must reference an existing category (checked in service layer before DB write)

---

## Entity: User

**Table**: `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `SERIAL` / `INTEGER` | `PRIMARY KEY`, auto-increment | Auto-assigned by DB |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | |
| `email` | `VARCHAR(320)` | `NOT NULL`, `UNIQUE` | Stored as lowercase; unique index enforces storage-level uniqueness |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Set by DB server |

**Relationships**: None (standalone entity in Phase 2)

**Constraints**:
- `UNIQUE (email)` — DB-level uniqueness

**Application-level validation** (unchanged from Phase 1):
- `full_name`: required, non-empty after strip, max 150 chars
- `email`: valid email format (Pydantic `EmailStr`); case-insensitive uniqueness enforced by lowercasing before DB write

---

## Entity Relationships Diagram

```
categories
    id (PK)
    name (UNIQUE)
    description
    created_at
        │
        │ 1
        │
        ▼ N
    products
        id (PK)
        name
        description
        price
        stock
        category_id (FK → categories.id, RESTRICT)
        created_at

users   (standalone — no FK relationships in Phase 2)
    id (PK)
    email (UNIQUE)
    full_name
    created_at
```

---

## Migration Strategy

- **Initial migration**: Creates all three tables with all constraints listed above.
- **Migration tool**: Alembic with async engine support.
- **`Base.metadata.create_all()` is forbidden in production code** — all schema creation goes through Alembic.
- **Test environment**: Tables are created via `Base.metadata.create_all()` in the test session fixture only (not production). This is the one permitted exception, explicitly scoped to tests.

---

## ORM ↔ Pydantic Mapping

All `*Read` Pydantic schemas have `model_config = ConfigDict(from_attributes=True)`, allowing direct construction from SQLAlchemy ORM model instances. No field name mapping changes are needed.

| Pydantic field | DB column | Notes |
|---|---|---|
| `id: int` | `id INTEGER` | Auto |
| `name: str` | `name VARCHAR` | |
| `description: str` | `description TEXT` | Always non-null |
| `price: float` | `price NUMERIC(10,2)` | Pydantic coerces `Decimal` → `float` |
| `stock: int` | `stock INTEGER` | |
| `category_id: int` | `category_id INTEGER` | |
| `email: str` | `email VARCHAR` | |
| `full_name: str` | `full_name VARCHAR` | |
| `created_at: datetime` | `created_at TIMESTAMPTZ` | |
