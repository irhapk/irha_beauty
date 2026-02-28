# Quickstart: Database Connection — Phase 2

**Feature**: 002-db-connection
**Date**: 2026-02-28

---

## Prerequisites

1. NeonDB account with two databases created:
   - `irha_beauty` — production/development database
   - `irha_beauty_test` — test database (can be a NeonDB branch)
2. Python 3.12+ environment
3. Phase 1 code complete and 35 tests passing

---

## Environment Setup

Create `backend/.env` (gitignored — never committed):
```env
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxxx.region.aws.neon.tech/irha_beauty?sslmode=require
TEST_DATABASE_URL=postgresql+asyncpg://user:password@ep-xxxx.region.aws.neon.tech/irha_beauty_test?sslmode=require
```

Create `backend/.env.example` (committed — no real values):
```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/DBNAME?sslmode=require
TEST_DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/TEST_DBNAME?sslmode=require
```

---

## Install New Packages

```bash
cd backend
pip install sqlalchemy[asyncio] asyncpg alembic pydantic-settings
```

Updated `requirements.txt`:
```
fastapi
uvicorn[standard]
pydantic[email]
httpx
pytest
pytest-asyncio
sqlalchemy[asyncio]
asyncpg
alembic
pydantic-settings
```

---

## Run Migrations

```bash
cd backend
alembic upgrade head
```

This applies the initial migration that creates `categories`, `products`, `users` tables.

---

## Start the Server

```bash
cd backend
uvicorn app.main:app --reload
```

The server now reads/writes to NeonDB. Restart the server — all data persists.

---

## Run Tests

```bash
cd backend
pytest
```

The test suite runs against `TEST_DATABASE_URL`. Each test runs in an isolated transaction that rolls back — no data persists between tests. All 35 original tests must pass, plus any new Phase 2 tests.

---

## Integration Test Scenarios

### Scenario 1: Verify Persistence

```bash
# Start server (uvicorn)
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Skincare"}'
# → 201, id: 1

# Stop and restart server (Ctrl+C, uvicorn again)

curl http://localhost:8000/api/v1/categories/1
# → 200, {"id": 1, "name": "Skincare", ...}
```

### Scenario 2: Cross-domain FK Validation

```bash
# Create category
curl -X POST http://localhost:8000/api/v1/categories \
  -d '{"name": "Lipcare"}' -H "Content-Type: application/json"
# → 201, id: 1

# Create product with valid category
curl -X POST http://localhost:8000/api/v1/products \
  -d '{"name": "Lip Balm", "price": 5.99, "stock": 100, "category_id": 1}' \
  -H "Content-Type: application/json"
# → 201

# Attempt to create product with invalid category
curl -X POST http://localhost:8000/api/v1/products \
  -d '{"name": "Lip Gloss", "price": 7.99, "stock": 50, "category_id": 999}' \
  -H "Content-Type: application/json"
# → 404, {"detail": "Category not found", "code": "CATEGORY_NOT_FOUND"}
```

### Scenario 3: Category Delete with Products (New Phase 2 Behaviour)

```bash
# Category 1 has a product from Scenario 2 above
curl -X DELETE http://localhost:8000/api/v1/categories/1
# → 409, {"detail": "Cannot delete category with associated products", "code": "CATEGORY_HAS_PRODUCTS"}

# Delete the product first
curl -X DELETE http://localhost:8000/api/v1/products/1
# → 204

# Now category can be deleted
curl -X DELETE http://localhost:8000/api/v1/categories/1
# → 204
```

### Scenario 4: User Email Uniqueness

```bash
curl -X POST http://localhost:8000/api/v1/users \
  -d '{"full_name": "Fatima Khan", "email": "fatima@example.com"}' \
  -H "Content-Type: application/json"
# → 201

curl -X POST http://localhost:8000/api/v1/users \
  -d '{"full_name": "Fatima Two", "email": "FATIMA@EXAMPLE.COM"}' \
  -H "Content-Type: application/json"
# → 409, {"detail": "...", "code": "EMAIL_ALREADY_EXISTS"}
```

---

## New Files After Phase 2

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py         ← NEW: pydantic-settings Settings class
│   │   ├── database.py       ← NEW: async engine, sessionmaker, Base
│   │   └── deps.py           ← NEW: get_db dependency
│   ├── categories/
│   │   ├── models.py         ← NEW: Category ORM model
│   │   └── repository.py     ← NEW: Category DB queries
│   ├── products/
│   │   ├── models.py         ← NEW: Product ORM model
│   │   └── repository.py     ← NEW: Product DB queries
│   └── users/
│       ├── models.py         ← NEW: User ORM model
│       └── repository.py     ← NEW: User DB queries
├── alembic/
│   ├── env.py                ← NEW: Alembic async config
│   └── versions/
│       └── 0001_initial.py   ← NEW: Initial migration
├── alembic.ini               ← NEW: Alembic config file
├── .env                      ← NEW: Secrets (gitignored)
└── .env.example              ← NEW: Template (committed)
```

**Modified files**:
- `app/core/exceptions.py` — add `CATEGORY_HAS_PRODUCTS` error
- `app/categories/service.py` — make async, use repository
- `app/products/service.py` — make async, use repository
- `app/users/service.py` — make async, use repository
- `app/categories/router.py` — inject `db: AsyncSession = Depends(get_db)`
- `app/products/router.py` — inject `db: AsyncSession = Depends(get_db)`
- `app/users/router.py` — inject `db: AsyncSession = Depends(get_db)`
- `conftest.py` — replace in-memory fixtures with DB session + override pattern
- `requirements.txt` — add new packages
