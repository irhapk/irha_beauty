# Tasks: Database Connection — Phase 2

**Input**: Design documents from `/specs/002-db-connection/`
**Branch**: `002-db-connection`
**Date**: 2026-02-28

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Included — 35 existing tests must pass (US2 verification) + 1 new test (US3).

**Organization**: Tasks grouped by user story. US1 (Persistence) and US2 (API Preservation) are both P1 — US1 is the code work, US2 is the verification layer. US3 (DB Integrity) is P2 and adds the category RESTRICT delete check.

**IMPORTANT — Test ID Assertion Note**: Existing tests assert `data["id"] == 1`. This is preserved by using `TRUNCATE ... RESTART IDENTITY CASCADE` in the `db_session` teardown, which resets PostgreSQL sequences after each test. Each test starts fresh with sequences at 1.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Add new packages and environment configuration.

- [x] T001 [P] Update `backend/requirements.txt` — add `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `pydantic-settings` on new lines below existing packages
- [x] T002 [P] Create `backend/.env.example` with placeholder values (`DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/DBNAME?sslmode=require` and `TEST_DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/TEST_DBNAME?sslmode=require`); verify `backend/.gitignore` exists and contains `.env` (create `.gitignore` with `.env` if missing)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every domain depends on. No user story work starts until this phase is complete.

**⚠️ CRITICAL**: Complete Phase 2 before any Phase 3–5 work.

- [x] T003 Create `backend/app/core/config.py` — define `Settings(BaseSettings)` with `model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")` and two fields: `DATABASE_URL: str` and `TEST_DATABASE_URL: str`; expose `settings = Settings()` singleton at module level
- [x] T004 Create `backend/app/core/database.py` — import `settings` from `config`; create `engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)`; create `AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)`; define `class Base(DeclarativeBase): pass`
- [x] T005 [P] Create `backend/app/core/deps.py` — define `async def get_db() -> AsyncGenerator[AsyncSession, None]` that does `async with AsyncSessionLocal() as session: yield session`
- [x] T006 [P] Initialize Alembic in `backend/` — run `alembic init alembic` to create `alembic/` directory and `alembic.ini`; in `alembic.ini` set `script_location = alembic` and leave `sqlalchemy.url` empty; rewrite `alembic/env.py` with the async pattern: import `asyncio`, `settings`, `Base`; define `do_run_migrations(connection)` and `async def run_migrations_online()` using `create_async_engine(settings.DATABASE_URL)` + `conn.run_sync(do_run_migrations)` + `asyncio.run(run_migrations_online())`; do NOT add model imports yet (models don't exist until Phase 3)

**Checkpoint**: `python -c "from app.core.config import settings; from app.core.database import engine, Base; from app.core.deps import get_db; print('OK')"` runs without error (requires a `.env` file with valid DATABASE_URL).

---

## Phase 3: User Story 1 — Data Persists Across Restarts (Priority: P1) 🎯

**Goal**: Replace all in-memory dict stores with real PostgreSQL DB. Data survives server restarts.

**Independent Test**: Create a category via POST, restart the server, call GET — it returns 200 with the same data. Verifiable once this phase is complete.

### ORM Models (Parallel — all independent)

- [x] T007 [P] [US1] Create `backend/app/categories/models.py` — define `class Category(Base)` with `__tablename__ = "categories"` and `Mapped[]`-annotated columns: `id: Mapped[int] = mapped_column(primary_key=True)`, `name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)`, `description: Mapped[str] = mapped_column(Text, nullable=False, server_default="")`, `created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())`; add relationship `products: Mapped[list["Product"]] = relationship(back_populates="category", lazy="selectin")`
- [x] T008 [P] [US1] Create `backend/app/products/models.py` — define `class Product(Base)` with `__tablename__ = "products"` and columns: `id` (PK), `name` (String(200), not null), `description` (Text, not null, server_default=""), `price` (Numeric(10,2), not null), `stock` (Integer, not null, server_default="0"), `category_id` (ForeignKey("categories.id", ondelete="RESTRICT"), not null), `created_at` (DateTime timezone, server_default=func.now()); add relationship `category: Mapped["Category"] = relationship(back_populates="products")`
- [x] T009 [P] [US1] Create `backend/app/users/models.py` — define `class User(Base)` with `__tablename__ = "users"` and columns: `id` (PK), `full_name` (String(150), not null), `email` (String(320), not null, unique=True), `created_at` (DateTime timezone, server_default=func.now())

### Initial Migration (Sequential — depends on all 3 models + Alembic setup)

- [x] T010 [US1] Complete Alembic migration setup and apply to dev DB:
  1. Add model imports to `backend/alembic/env.py`: `from app.categories.models import Category  # noqa`, `from app.products.models import Product  # noqa`, `from app.users.models import User  # noqa`; set `target_metadata = Base.metadata`
  2. From `backend/`, run: `alembic revision --autogenerate -m "initial_schema"`
  3. Review the generated file in `alembic/versions/` — verify all 3 tables appear with correct columns, unique constraints, FK with ON DELETE RESTRICT, and CHECK constraints
  4. Run: `alembic upgrade head`
  5. Verify tables exist in NeonDB

### Repositories (Parallel — each depends only on its own model)

- [x] T011 [P] [US1] Create `backend/app/categories/repository.py` — define these async functions (all take `db: AsyncSession` as first param): `create_category(db, data: CategoryCreate) -> Category` (adds to session, commits, returns ORM object); `list_categories(db) -> list[Category]` (selects all); `get_category(db, category_id: int) -> Category | None` (select by PK, returns None if not found); `get_category_by_name(db, name: str) -> Category | None` (select where name ilike name); `update_category(db, category: Category, data: CategoryUpdate) -> Category` (mutates ORM fields, commits); `delete_category(db, category: Category) -> None` (deletes from session, commits); `count_products_by_category(db, category_id: int) -> int` (SELECT COUNT(*) FROM products WHERE category_id=?)
- [x] T012 [P] [US1] Create `backend/app/products/repository.py` — define async functions: `create_product(db, data: ProductCreate) -> Product`; `list_products(db) -> list[Product]`; `get_product(db, product_id: int) -> Product | None`; `update_product(db, product: Product, data: ProductUpdate) -> Product`; `delete_product(db, product: Product) -> None`
- [x] T013 [P] [US1] Create `backend/app/users/repository.py` — define async functions: `create_user(db, data: UserCreate) -> User`; `list_users(db) -> list[User]`; `get_user(db, user_id: int) -> User | None`; `get_user_by_email(db, email: str) -> User | None` (select where lower(email) = lower(email_param)); `update_user(db, user: User, data: UserUpdate) -> User`; `delete_user(db, user: User) -> None`

### Services (Parallel — each depends only on its own repository)

- [x] T014 [P] [US1] Update `backend/app/categories/service.py` — convert all 5 functions to `async def`; add `db: AsyncSession` as first parameter to each; replace all in-memory `_store` dict operations with `await repository.<function>(db, ...)` calls; keep all `AppException` raise logic in the service; remove `_store`, `_counter`, and `reset_store()` entirely. Function signatures: `create_category(db, data)`, `list_categories(db)`, `get_category(db, category_id)`, `update_category(db, category_id, data)`, `delete_category(db, category_id)`. Return `CategoryRead.model_validate(orm_obj)` from all functions that return a schema.
- [x] T015 [P] [US1] Update `backend/app/products/service.py` — same pattern as T014: make async, add `db: AsyncSession`, use repository calls, remove in-memory store. Cross-domain check: `get_category(db, data.category_id)` call must use category repository (import `from app.categories import repository as category_repo`). Return `ProductRead.model_validate(orm_obj)`.
- [x] T016 [P] [US1] Update `backend/app/users/service.py` — same pattern: async, db param, repository calls, remove in-memory store. Case-insensitive email uniqueness: call `await repository.get_user_by_email(db, data.email)` and raise `EMAIL_ALREADY_EXISTS` (409) if found. Return `UserRead.model_validate(orm_obj)`.

### Routers (Parallel — each depends only on its own service being async)

- [x] T017 [P] [US1] Update `backend/app/categories/router.py` — add `from sqlalchemy.ext.asyncio import AsyncSession` and `from fastapi import Depends` and `from app.core.deps import get_db` imports; add `db: AsyncSession = Depends(get_db)` parameter to every endpoint function; change all service calls to `await service.<function>(db, ...)`. No other changes.
- [x] T018 [P] [US1] Update `backend/app/products/router.py` — same pattern as T017: add db param, await service calls.
- [x] T019 [P] [US1] Update `backend/app/users/router.py` — same pattern as T017: add db param, await service calls.

### Test Infrastructure (Sequential — depends on models + deps being ready)

- [x] T020 [US1] Update `backend/conftest.py` — replace the existing in-memory fixture with DB session infrastructure:
  1. Import `AsyncSession`, `create_async_engine`, `async_sessionmaker`, `text` from sqlalchemy
  2. Import `Base` from `app.core.database`, `get_db` from `app.core.deps`, `settings` from `app.core.config`; import all 3 models (`from app.categories.models import Category`, etc.) so `Base.metadata` has all tables
  3. Create `TEST_ENGINE = create_async_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)`
  4. Create `TestSessionLocal = async_sessionmaker(TEST_ENGINE, class_=AsyncSession, expire_on_commit=False)`
  5. Add `@pytest.fixture(scope="session", autouse=True) async def setup_test_db()` that creates all tables via `Base.metadata.create_all` on startup and drops them on teardown
  6. Add `@pytest.fixture async def db_session()` that yields a `TestSessionLocal()` session; in teardown, execute `TRUNCATE products, users, categories RESTART IDENTITY CASCADE` and commit (resets sequences so id=1 for each test)
  7. Update `async_client` fixture to accept `db_session`, override `app.dependency_overrides[get_db]` with a function that yields `db_session`, yield the client, then clear `app.dependency_overrides`

**Checkpoint (US1 complete)**: Server reads/writes from NeonDB. `uvicorn app.main:app` starts. POST a category, restart, GET it back — persists. ✅

---

## Phase 4: User Story 2 — All Existing API Behaviour Preserved (Priority: P1)

**Goal**: All 35 Phase 1 tests pass unmodified (except removing the now-invalid `reset_store()` calls). Zero breaking changes to API contracts.

**Independent Test**: `pytest` from `backend/` — all 35 tests pass.

### Remove In-Memory Reset Fixtures (Parallel — different files)

- [x] T021 [P] [US2] Update `backend/app/categories/tests/test_categories.py` — remove the `reset_store` fixture function and its `autouse=True` decorator entirely; remove the `from app.categories import service as category_service` import if only used by that fixture. No other changes to this file.
- [x] T022 [P] [US2] Update `backend/app/products/tests/test_products.py` — remove the `reset_stores` fixture function and its `autouse=True` decorator entirely; remove the `from app.categories import service as category_service` and `from app.products import service as product_service` imports if only used by that fixture. No other changes to this file.
- [x] T023 [P] [US2] Update `backend/app/users/tests/test_users.py` — remove the `reset_store` fixture function and its `autouse=True` decorator entirely; remove the `from app.users import service as user_service` import if only used by that fixture. No other changes to this file.

### Verification

- [x] T024 [US2] Run `pytest` from `backend/` — all 35 tests must pass. If any test fails, debug and fix the relevant service/repository/router (do not modify test assertions). Common failure causes: session commit timing, sequence not resetting, async/await missing.

**Checkpoint (US2 complete)**: 35/35 tests green. API contracts fully preserved. ✅

---

## Phase 5: User Story 3 — Data Integrity Enforced at Storage Level (Priority: P2)

**Goal**: Storage-level constraints are enforced. New behaviour: deleting a category that has products returns 409 CATEGORY_HAS_PRODUCTS.

**Independent Test**: Create a category with one product, attempt DELETE on the category — must return 409. Delete the product first, then DELETE the category — must return 204.

- [x] T025 [US3] Add RESTRICT check to `delete_category` in `backend/app/categories/service.py`:
  1. Before calling `repository.delete_category(db, category)`, call `count = await repository.count_products_by_category(db, category_id)`
  2. If `count > 0`, raise `AppException(detail="Cannot delete category with associated products", code="CATEGORY_HAS_PRODUCTS", status_code=409)`
  3. The `repository.count_products_by_category` function already created in T011 provides this count
- [x] T026 [US3] Add new test `test_delete_category_with_products` to `backend/app/categories/tests/test_categories.py`:
  1. Create a category via POST
  2. Create a product in that category via POST `/api/v1/products`
  3. Attempt DELETE on the category — assert `response.status_code == 409` and `response.json()["code"] == "CATEGORY_HAS_PRODUCTS"`
  4. Delete the product via DELETE `/api/v1/products/{product_id}`
  5. Retry DELETE on the category — assert `response.status_code == 204`

**Checkpoint (US3 complete)**: RESTRICT behaviour works end-to-end. DB schema has FK ON DELETE RESTRICT. 36/36 tests green. ✅

---

## Phase 6: Polish & Validation

- [x] T027 Run full `pytest` from `backend/` — verify all 36 tests pass (35 original + 1 new `test_delete_category_with_products`). Zero failures required.
- [x] T028 [P] Manual persistence verification per quickstart.md Scenario 1: start server, POST a category, stop server (`Ctrl+C`), restart server, GET the category by ID — must return 200 with the same data.
- [x] T029 [P] Verify `/docs` endpoint returns 200 and shows all 15 endpoints with correct schemas. Verify `DATABASE_URL` does not appear in any committed file (`git grep DATABASE_URL -- '*.py'` — only `config.py` and `.env.example` should match, never actual credentials).

**Checkpoint**: All 36 tests pass, persistence verified, docs load, no secrets committed. Phase 2 complete. ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001 and T002 are parallel.
- **Phase 2 (Foundational)**: Requires Phase 1. T003 → T004 → (T005 ‖ T006) in sequence.
- **Phase 3 (US1)**: Requires Phase 2. ORM models (T007, T008, T009) can start immediately after T004. Migration (T010) needs all models + T006. Repos after models. Services after repos. Routers after services. conftest (T020) after all models + T005.
- **Phase 4 (US2)**: Requires Phase 3 complete (T020 especially). T021–T023 parallel. T024 after T021–T023.
- **Phase 5 (US3)**: Requires T011 (repository) and T014 (service). T025 then T026.
- **Phase 6 (Polish)**: Requires all prior phases complete.

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|---|---|---|
| US1 Persistence (P1) | Phase 2 | Nothing — foundational |
| US2 API Preservation (P1) | US1 complete (T020) | — |
| US3 DB Integrity (P2) | T011 + T014 | Can start once T014 done |

### Within Phase 3 (Largest Phase — Strict Order Per Column)

```
T004 (database.py)
    ↓
T007 [P] categories/models.py   T008 [P] products/models.py   T009 [P] users/models.py
    └──────────────────────────────────────────────────────────────┘
    ↓ (all 3 models + T006)
T010 migration (alembic revision + upgrade head)
    ↓
T011 [P] categories/repository.py   T012 [P] products/repository.py   T013 [P] users/repository.py
    ↓
T014 [P] categories/service.py   T015 [P] products/service.py   T016 [P] users/service.py
    ↓
T017 [P] categories/router.py   T018 [P] products/router.py   T019 [P] users/router.py
    ↓
T020 conftest.py (depends on T005 + all models)
```

### Parallel Opportunities

- T001 ‖ T002 (Phase 1)
- T005 ‖ T006 (Phase 2, both after T004)
- T007 ‖ T008 ‖ T009 (ORM models)
- T011 ‖ T012 ‖ T013 (Repositories)
- T014 ‖ T015 ‖ T016 (Services)
- T017 ‖ T018 ‖ T019 (Routers)
- T021 ‖ T022 ‖ T023 (Remove reset_store)
- T028 ‖ T029 (Polish verification)

---

## Implementation Strategy

### MVP: US1 Only (Phases 1–3)

1. Phase 1: Update requirements, create .env.example
2. Phase 2: config.py → database.py → deps.py + Alembic init
3. Phase 3: Models → Migration → Repos → Services → Routers → conftest
4. **STOP and validate**: `uvicorn app.main:app`, create/retrieve data, restart server, retrieve again

### Full Phase 2 Delivery

1. MVP above
2. Phase 4: Remove reset_store, verify 35/35 tests
3. Phase 5: RESTRICT check + new test
4. Phase 6: Full suite 36/36, manual verify, docs check

---

## Summary

| Metric | Value |
|---|---|
| Total tasks | 29 (T001–T029) |
| Setup tasks | 2 |
| Foundational tasks | 4 |
| US1 Persistence tasks | 14 |
| US2 API Preservation tasks | 4 |
| US3 DB Integrity tasks | 2 |
| Polish tasks | 3 |
| New files created | 11 (config, database, deps, 3 models, 3 repos, .env.example, alembic/) |
| Existing files modified | 10 (3 services, 3 routers, 3 test files, conftest.py) |
| Tests: existing | 35 (unchanged assertions) |
| Tests: new | 1 (CATEGORY_HAS_PRODUCTS) |
| Total tests after Phase 2 | 36 |
| Parallel opportunities | T001‖T002, T005‖T006, T007–T009, T011–T013, T014–T016, T017–T019, T021–T023, T028‖T029 |
