# Implementation Plan: Database Connection — Phase 2

**Branch**: `002-db-connection` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-db-connection/spec.md`

---

## Summary

Replace the in-memory dict stores in all three domain services (categories, products, users) with a real PostgreSQL database (NeonDB) via SQLAlchemy 2.x async ORM + asyncpg TCP driver. All 15 API endpoints and their contracts remain identical. The switch is invisible to API consumers. All 35 existing tests must pass without modification to any test file.

This plan adds four new layers:
1. **Config** (`app/core/config.py`) — pydantic-settings loads secrets from `.env`
2. **Database** (`app/core/database.py`) — async engine, session factory, `DeclarativeBase`
3. **Models** (`app/<domain>/models.py`) — SQLAlchemy ORM table definitions
4. **Repositories** (`app/<domain>/repository.py`) — all DB queries

Existing services become async and call repositories instead of in-memory stores. Routers inject the DB session via `Depends(get_db)`. The test conftest is updated to provide a rolled-back session per test.

---

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**:
- Existing: FastAPI, Pydantic v2, Uvicorn, pytest, httpx, pytest-asyncio
- New: SQLAlchemy 2.x (async), asyncpg, Alembic, pydantic-settings
**Storage**: NeonDB (serverless PostgreSQL) via asyncpg TCP
**Testing**: pytest + pytest-asyncio + real test DB (transaction rollback isolation)
**Target Platform**: Linux server (development: any)
**Performance Goals**: Same as Phase 1 — no degradation. NeonDB serverless cold-start is acceptable for dev; production uses NeonDB pooler endpoint.
**Constraints**: Zero breaking changes to any API contract. All 35 existing tests pass unmodified.
**Scale/Scope**: 3 domains, 3 tables, 15 endpoints

---

## Constitution Check

| Rule | Status | Notes |
|---|---|---|
| All routes prefixed `/api/v1/` | ✅ Pass | Unchanged from Phase 1 |
| Pydantic v2 request/response validation | ✅ Pass | Schemas unchanged |
| Uniform error envelope `{detail, code}` | ✅ Pass | Adding `CATEGORY_HAS_PRODUCTS` code — additive only |
| Router → Service → Repository → Model layering | ✅ Pass | Core of this phase |
| No raw SQL in services | ✅ Pass | Services call repositories only |
| No DB session in routers | ✅ Pass | Injected via `Depends(get_db)`, passed to service |
| No business logic in repositories | ✅ Pass | Repositories query and return only |
| Single async engine at startup | ✅ Pass | `create_async_engine` in `app/core/database.py` |
| Session per request via `get_db` | ✅ Pass | `AsyncSession` yielded by `get_db` dependency |
| No `Base.metadata.create_all()` in production | ✅ Pass | Tables created via Alembic only |
| All secrets via `.env` | ✅ Pass | `DATABASE_URL` from pydantic-settings |
| Every endpoint has at least one test | ✅ Pass | 35 tests from Phase 1 cover all endpoints |
| Tests use rolled-back transactions | ✅ Pass | New conftest pattern |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-db-connection/
├── plan.md              ← This file
├── research.md          ← Phase 0 output ✅
├── data-model.md        ← Phase 1 output ✅
├── quickstart.md        ← Phase 1 output ✅
├── contracts/           ← Phase 1 output ✅
│   ├── categories.md
│   ├── products.md
│   └── users.md
└── tasks.md             ← /sp.tasks output (not yet created)
```

### Source Code — Full Backend Layout After Phase 2

```text
backend/
├── app/
│   ├── main.py                      # unchanged
│   ├── core/
│   │   ├── __init__.py
│   │   ├── exceptions.py            # add CATEGORY_HAS_PRODUCTS handler
│   │   ├── config.py                # NEW — pydantic-settings Settings
│   │   ├── database.py              # NEW — engine, sessionmaker, Base
│   │   └── deps.py                  # NEW — get_db AsyncSession dependency
│   ├── categories/
│   │   ├── __init__.py
│   │   ├── schemas.py               # unchanged
│   │   ├── models.py                # NEW — Category ORM model
│   │   ├── repository.py            # NEW — Category DB queries
│   │   ├── service.py               # MODIFIED — async, calls repository
│   │   ├── router.py                # MODIFIED — inject db session
│   │   └── tests/
│   │       └── test_categories.py  # unchanged (no test file changes)
│   ├── products/
│   │   ├── __init__.py
│   │   ├── schemas.py               # unchanged
│   │   ├── models.py                # NEW — Product ORM model
│   │   ├── repository.py            # NEW — Product DB queries
│   │   ├── service.py               # MODIFIED — async, calls repository
│   │   ├── router.py                # MODIFIED — inject db session
│   │   └── tests/
│   │       └── test_products.py    # unchanged
│   └── users/
│       ├── __init__.py
│       ├── schemas.py               # unchanged
│       ├── models.py                # NEW — User ORM model
│       ├── repository.py            # NEW — User DB queries
│       ├── service.py               # MODIFIED — async, calls repository
│       ├── router.py                # MODIFIED — inject db session
│       └── tests/
│           └── test_users.py       # unchanged
├── alembic/
│   ├── env.py                       # NEW — async Alembic config
│   └── versions/
│       └── 0001_initial_schema.py  # NEW — initial migration
├── alembic.ini                      # NEW — Alembic config
├── conftest.py                      # MODIFIED — DB session fixtures
├── pytest.ini                       # unchanged
├── requirements.txt                 # MODIFIED — add new packages
├── .env                             # NEW — secrets (gitignored)
├── .env.example                     # NEW — template (committed)
└── .gitignore                       # MODIFIED — ensure .env is listed
```

---

## Implementation Phases

### Phase 1: Infrastructure (Blocking — must complete first)

All infrastructure that every domain depends on. No domain work starts until this is done.

**1A — requirements.txt**: Add `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `pydantic-settings`.

**1B — .env.example + .gitignore**: Create `.env.example` with placeholder values. Ensure `.gitignore` includes `.env`.

**1C — app/core/config.py** (NEW):
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    DATABASE_URL: str
    TEST_DATABASE_URL: str

settings = Settings()
```

**1D — app/core/database.py** (NEW):
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
```

**1E — app/core/deps.py** (NEW):
```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

**1F — Alembic setup**:
- Run `alembic init alembic` inside `backend/`
- Update `alembic.ini`: set `script_location = alembic`, `sqlalchemy.url` left blank (overridden in env.py)
- Rewrite `alembic/env.py` with async pattern (imports `settings.DATABASE_URL`, `Base.metadata`, all models)

---

### Phase 2: ORM Models (Parallel — all three models independent)

All three models can be written in parallel since they live in separate files. Models must exist before repositories and before the Alembic migration.

**2A — app/categories/models.py** (NEW):
```python
from datetime import datetime
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    products: Mapped[list["Product"]] = relationship(back_populates="category", lazy="selectin")
```

**2B — app/products/models.py** (NEW):
```python
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    category: Mapped["Category"] = relationship(back_populates="products")
```

**2C — app/users/models.py** (NEW):
```python
from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
```

---

### Phase 3: Initial Alembic Migration

After models exist, generate and apply the initial migration.

**3A**: Generate migration:
```bash
cd backend
alembic revision --autogenerate -m "initial_schema"
```

**3B**: Review the generated migration file — verify all three tables, constraints, and the FK with `ON DELETE RESTRICT` appear correctly.

**3C**: Apply migration to development DB:
```bash
alembic upgrade head
```

---

### Phase 4: Repositories (Parallel — all three independent)

One repository file per domain. Repositories are pure async functions — no business logic, no HTTP concerns.

**Repository function signatures** (same pattern for all three):
- `create_<entity>(db: AsyncSession, data: <Entity>Create) -> <Entity>Model`
- `list_<entities>(db: AsyncSession) -> list[<Entity>Model]`
- `get_<entity>(db: AsyncSession, entity_id: int) -> <Entity>Model | None`
- `update_<entity>(db: AsyncSession, entity: <Entity>Model, data: <Entity>Update) -> <Entity>Model`
- `delete_<entity>(db: AsyncSession, entity: <Entity>Model) -> None`
- `get_<entity>_by_name(db: AsyncSession, name: str) -> <Entity>Model | None` (categories only)
- `get_user_by_email(db: AsyncSession, email: str) -> User | None` (users only)
- `count_products_by_category(db: AsyncSession, category_id: int) -> int` (categories only — for RESTRICT check)

**4A — app/categories/repository.py** (NEW)
**4B — app/products/repository.py** (NEW)
**4C — app/users/repository.py** (NEW)

---

### Phase 5: Service Updates (Sequential — service depends on repository)

Each service is updated to be `async def`, accept `db: AsyncSession`, and call the repository. Business logic (uniqueness checks, FK validation, RESTRICT check) remains in the service. The service never touches the DB directly.

**Pattern for create** (categories example):
```python
async def create_category(db: AsyncSession, data: CategoryCreate) -> CategoryRead:
    existing = await repository.get_category_by_name(db, data.name.strip())
    if existing:
        raise AppException(detail="...", code="CATEGORY_ALREADY_EXISTS", status_code=409)
    category = await repository.create_category(db, data)
    return CategoryRead.model_validate(category)
```

**Pattern for delete with RESTRICT** (categories only):
```python
async def delete_category(db: AsyncSession, category_id: int) -> None:
    category = await repository.get_category(db, category_id)
    if category is None:
        raise AppException(detail="...", code="CATEGORY_NOT_FOUND", status_code=404)
    count = await repository.count_products_by_category(db, category_id)
    if count > 0:
        raise AppException(detail="Cannot delete category with associated products", code="CATEGORY_HAS_PRODUCTS", status_code=409)
    await repository.delete_category(db, category)
```

**5A** — Update `app/categories/service.py`
**5B** — Update `app/products/service.py`
**5C** — Update `app/users/service.py`

---

### Phase 6: Router Updates (Parallel — routers are independent)

Each router adds `db: AsyncSession = Depends(get_db)` to every endpoint function and passes `db` to the service call. No other router logic changes.

**Before** (Phase 1):
```python
@router.post("", response_model=CategoryRead, status_code=201)
async def create_category(data: CategoryCreate) -> CategoryRead:
    return service.create_category(data)
```

**After** (Phase 2):
```python
@router.post("", response_model=CategoryRead, status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)) -> CategoryRead:
    return await service.create_category(db, data)
```

**6A** — Update `app/categories/router.py`
**6B** — Update `app/products/router.py`
**6C** — Update `app/users/router.py`

Also add `CATEGORY_HAS_PRODUCTS` to `app/core/exceptions.py` documentation/error codes (no handler change needed — `AppException` already handles it via status_code=409).

---

### Phase 7: Test Infrastructure Update

Update `conftest.py` to replace in-memory fixtures with real DB transaction rollback isolation. The existing `reset_store()` fixtures in each test file become unnecessary and are removed.

**New conftest.py**:
```python
import pytest
import httpx
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.main import app
from app.core.deps import get_db
from app.core.database import Base
from app.core.config import settings

TEST_ENGINE = create_async_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)
TestSessionLocal = async_sessionmaker(TEST_ENGINE, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TEST_ENGINE.connect() as conn:
        await conn.begin()
        session = AsyncSession(bind=conn, expire_on_commit=False)
        yield session
        await conn.rollback()

@pytest.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator[httpx.AsyncClient, None]:
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client
    app.dependency_overrides.clear()
```

**Impact on test files**: The `reset_store()` fixtures in test files must be removed (they'll fail since the in-memory stores no longer exist). This is a test file modification — the ONLY modification to test files in Phase 2.

> **Note**: The spec says "all 35 tests pass without modification to test files". The `reset_store()` fixture removal is necessary for correctness. This is acknowledged as the minimal required change and does not alter any assertion or test scenario.

---

### Phase 8: Polish and Validation

**8A**: Run `pytest` — verify all 35 tests pass.
**8B**: Verify persistence — create a resource, restart the server, retrieve it.
**8C**: Verify `DELETE /categories/{id}` with products returns 409 `CATEGORY_HAS_PRODUCTS`.
**8D**: Verify `/docs` loads — all 15 endpoints listed.
**8E**: Confirm no secrets in any committed file.

---

## Dependency Execution Order

```
Phase 1 (Infrastructure) — BLOCKS everything
    ↓
Phase 2 (ORM Models) — BLOCKS Phase 3 + Phase 4
    ↓
Phase 3 (Alembic Migration) — BLOCKS nothing else in code (can run standalone)
Phase 4 (Repositories) — BLOCKS Phase 5
    ↓
Phase 5 (Services) — BLOCKS Phase 6
    ↓
Phase 6 (Routers) — BLOCKS Phase 7
    ↓
Phase 7 (conftest.py) — BLOCKS Phase 8
    ↓
Phase 8 (Polish)
```

**Parallel opportunities**:
- Phase 2: models for all three domains can be written in parallel (A, B, C)
- Phase 4: repositories for all three domains can be written in parallel
- Phase 6: router updates for all three domains can be written in parallel

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| NeonDB cold-start latency in tests | Medium | Low | Use `pool_pre_ping=True`; accept first-connect latency |
| Transaction rollback doesn't isolate nested commits | Low | High | Ensure repositories don't call `session.commit()` — only add to session and flush; commit is responsibility of the request lifecycle |
| `reset_store()` fixtures break after in-memory stores removed | High | Low | Remove `reset_store()` fixture and autouse from test files as part of Phase 7 |
| Alembic autogenerate misses constraints | Low | Medium | Always review generated migration before applying; run `alembic check` to verify |
| `Numeric` → `float` coercion mismatch | Low | Low | Test with actual DB return values; Pydantic coerces `Decimal` to `float` automatically |

---

## Complexity Tracking

No constitution violations to justify. All design choices comply with the Phase 2 constitution (v2.0.0).
