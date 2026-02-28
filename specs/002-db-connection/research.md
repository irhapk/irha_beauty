# Research: Database Connection — Phase 2

**Feature**: 002-db-connection
**Date**: 2026-02-28
**Purpose**: Resolve all technical decisions needed before writing the implementation plan.

---

## Decision 1: Async Engine and Session Factory

**Decision**: `create_async_engine` + `async_sessionmaker` with `AsyncSession`, created once at module level in `app/core/database.py`.

**Rationale**: SQLAlchemy 2.x introduced `async_sessionmaker` as the canonical factory for async sessions. Creating both at module load time (not per-request) is the correct pattern — the engine manages the connection pool, and the sessionmaker is a lightweight factory. Creating a new engine per-request is a known anti-pattern that exhausts connections.

**Concrete setup**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # reconnect if connection dropped (critical for serverless)
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # prevent lazy-load errors after commit
)

class Base(DeclarativeBase):
    pass
```

**NeonDB serverless note**: NeonDB suspends idle connections. `pool_pre_ping=True` ensures a dead connection is detected and replaced before use. For NeonDB, using connection pooling via their pooler endpoint (port 6432) is recommended over direct connections in production.

**Alternatives considered**:
- `sessionmaker` (sync) — incompatible with async FastAPI routes
- Creating engine per request — exhausts connections, rejected

---

## Decision 2: FastAPI get_db Dependency

**Decision**: Async generator dependency using `async with AsyncSessionLocal() as session: yield session`. Commits/rollbacks handled by the context manager.

**Rationale**: The session context manager auto-rolls-back on exception and auto-closes on exit. The router does not need explicit commit logic — repositories commit after writes. This is the recommended pattern in SQLAlchemy 2.x documentation.

**Concrete pattern**:
```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

**Alternatives considered**:
- `session.begin()` context manager — forces one transaction per request; less flexible when tests need to override the session
- Manual try/finally — more error-prone, rejected

---

## Decision 3: Test Isolation — Transaction Rollback Pattern

**Decision**: Each test gets an `AsyncSession` bound to an uncommitted database transaction. After the test, the outer transaction is rolled back. The FastAPI `get_db` dependency is overridden per-test to inject this session.

**Rationale**: This approach gives complete isolation without table truncation or DB recreation between tests. Each test sees a clean state because all its writes are inside a transaction that never commits. This is the recommended pattern for SQLAlchemy 2.x async test isolation.

**Concrete conftest.py pattern**:
```python
import pytest
import httpx
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.main import app
from app.core.deps import get_db
from app.core.database import Base

TEST_ENGINE = create_async_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)

@pytest.fixture(scope="session", autouse=True)
async def create_tables():
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

**Important**: The `reset_store()` fixtures in existing test files become no-ops (or are removed). Test isolation is now provided by the DB transaction rollback, not manual store clearing.

**Alternatives considered**:
- Table truncation between tests — slow and requires write access, rejected
- Separate DB per test — resource-heavy, rejected
- In-memory SQLite — doesn't support asyncpg, and NeonDB-specific constraints (e.g., RESTRICT FK) may behave differently, rejected

---

## Decision 4: Alembic Async Configuration

**Decision**: Configure `alembic/env.py` with async support using `asyncio.run` + `run_sync` for online migrations.

**Rationale**: Alembic was designed for sync SQLAlchemy. Async engines cannot be used directly in `env.py`. The documented pattern is to use `asyncio.run()` to run an async function inside `run_migrations_online`, and inside that async function, use `conn.run_sync(do_run_migrations)`.

**Concrete env.py pattern**:
```python
import asyncio
from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.core.database import Base

# Import all models here so Alembic sees them
from app.categories.models import Category  # noqa
from app.products.models import Product     # noqa
from app.users.models import User           # noqa

target_metadata = Base.metadata

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(settings.DATABASE_URL)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

asyncio.run(run_migrations_online())
```

**Alternatives considered**:
- Sync engine for Alembic only — complicates dependency management, rejected
- Using Aerich (Tortoise ORM migration tool) — different ORM, rejected

---

## Decision 5: NeonDB Connection String Format

**Decision**: `postgresql+asyncpg://user:password@host/dbname?sslmode=require`

**Rationale**: NeonDB is a PostgreSQL-compatible serverless database. asyncpg requires the `postgresql+asyncpg://` scheme. NeonDB requires SSL — the `?sslmode=require` parameter is mandatory for security and required by NeonDB's connection policy.

**NeonDB provides two connection types**:
- **Direct**: `postgresql+asyncpg://user:pass@ep-<id>.<region>.aws.neon.tech/dbname?sslmode=require` — use for development
- **Pooler**: `postgresql+asyncpg://user:pass@ep-<id>-pooler.<region>.aws.neon.tech/dbname?sslmode=require` — use for production (Serverless pooler on port 5432)

**For tests**: A separate NeonDB database (branch) or a local PostgreSQL instance is used. Variable name: `TEST_DATABASE_URL`.

**Alternatives considered**:
- psycopg2 (sync driver) — incompatible with async engine, rejected
- aiopg — less maintained, SQLAlchemy 2.x async recommends asyncpg, rejected

---

## Decision 6: pydantic-settings Configuration

**Decision**: `pydantic-settings` `BaseSettings` class in `app/core/config.py`, loaded from `.env` file. Single `settings` singleton imported everywhere needed.

**Rationale**: pydantic-settings provides type-safe, validated config loading from environment variables and `.env` files with zero boilerplate. It is the canonical approach for FastAPI + Pydantic v2 projects.

**Concrete pattern**:
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    DATABASE_URL: str
    TEST_DATABASE_URL: str

settings = Settings()
```

**Required packages**: `pydantic-settings` (separate from `pydantic` — must be installed explicitly).

**Alternatives considered**:
- `python-dotenv` + raw `os.environ` — no type validation, rejected
- Hardcoded values — violates security rules in constitution, rejected

---

## Decision 7: Category Delete Behaviour

**Decision**: **RESTRICT** — if a category has associated products, return `409 CATEGORY_HAS_PRODUCTS`. Do not cascade-delete products.

**Rationale**: In an e-commerce system, silently deleting all products when a category is deleted would be catastrophic data loss. The safe default is to block the delete and require the operator to reassign or delete products first. This is industry-standard behaviour (e.g., WooCommerce, Shopify — categories cannot be deleted if products are assigned to them without explicit handling).

**Implementation**:
- FK constraint: `FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT`
- Before calling the DB delete on category, the repository checks `SELECT COUNT(*) FROM products WHERE category_id = ?`
- If count > 0, raise `AppException(detail="Cannot delete category with associated products", code="CATEGORY_HAS_PRODUCTS", status_code=409)`
- This is a new error code — it does not exist in Phase 1 (Phase 1 had no cross-entity constraint check on delete). It must be added to `exceptions.py` documentation but does not break any existing test (no existing test deletes a category that has products).

**Alternatives considered**:
- `CASCADE` delete products — data loss risk, rejected
- `SET NULL` on category_id — products would have null category, violates not-null constraint, rejected

---

## Decision 8: Service Layer Changes

**Decision**: All service functions become `async def` and accept `db: AsyncSession` as first parameter. Internal in-memory store calls are replaced with `await repository.<function>(db, ...)` calls.

**Rationale**: The service layer is the business logic layer. It must remain the place that enforces business rules (duplicate checks, FK validation). The only change is that data retrieval and persistence go through the repository instead of the in-memory dict. Making services async is necessary because repository functions are async (they await DB operations).

**Impact on routers**: All router functions already use `async def`. They will inject `db: AsyncSession = Depends(get_db)` and pass `db` to the service. Router signatures change minimally — only adding the `db` parameter.

**No change to schemas**: Pydantic schemas remain identical. `from_attributes=True` on `*Read` schemas already supports ORM model → Pydantic conversion.

---

## Decision 9: ORM Model Field Mapping

**Decision**: Use SQLAlchemy 2.x `Mapped[]` annotation style with `mapped_column()`. Use `func.now()` with `server_default` for `created_at` to set the timestamp at DB level.

**Rationale**: `Mapped[]` annotations are the modern SQLAlchemy 2.x approach — they provide type safety and avoid the older `Column()` style that doesn't integrate cleanly with mypy. `func.now()` ensures timestamps are set by the DB server, not the application — consistent with FR-014.

**Price column**: Use `Numeric(10, 2)` in DB. SQLAlchemy returns `Decimal`; Pydantic's `float` field will coerce it. No schema changes needed.

**Alternatives considered**:
- `Column()` style (SQLAlchemy 1.x style) — works but lacks type annotation benefits, rejected
- `datetime.utcnow()` in Python for created_at — application-side timestamps can drift, rejected
