# Tasks: Backend CRUD APIs — Phase 1

**Input**: Design documents from `/specs/001-backend-crud-apis/`
**Branch**: `001-backend-crud-apis`
**Date**: 2026-02-28

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Included — mandated by constitution and SC-005 in spec.

**Organization**: Tasks are grouped by user story. Note: Categories (US2) is implemented before Products (US1) because Products depend on `category_id`. US3 (Users) is fully standalone.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Create the backend project structure and shared configuration.

- [x] T001 Create full backend/ directory structure: `backend/app/`, `backend/app/core/`, `backend/app/categories/`, `backend/app/categories/tests/`, `backend/app/products/`, `backend/app/products/tests/`, `backend/app/users/`, `backend/app/users/tests/` — add `__init__.py` to every package folder
- [x] T002 Create `backend/requirements.txt` with: `fastapi`, `uvicorn[standard]`, `pydantic[email]`, `httpx`, `pytest`, `pytest-asyncio`
- [x] T003 [P] Create `backend/pytest.ini` (or `pyproject.toml` `[tool.pytest.ini_options]`) setting `asyncio_mode = auto`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core app wiring that every domain depends on. No user story can start until this phase is complete.

**⚠️ CRITICAL**: Complete Phase 2 before any Phase 3–5 work.

- [x] T004 Create `backend/app/core/exceptions.py` — define `AppException(HTTPException)` and a global exception handler that returns `{"detail": "...", "code": "SCREAMING_SNAKE"}` for all 4xx errors
- [x] T005 Create `backend/app/main.py` — instantiate `FastAPI()` app, register the exception handler from `core/exceptions.py`, include all domain routers under prefix `/api/v1` (leave router imports commented-out placeholders until each domain is built)
- [x] T006 Create `backend/conftest.py` — define a pytest fixture `async_client` that returns an `httpx.AsyncClient` using `ASGITransport(app=app)` for use in all domain test files

**Checkpoint**: App skeleton runs (`uvicorn app.main:app`), returns 404 on unknown routes with correct error envelope.

---

## Phase 3: User Story 2 — Manage Categories (Priority: P2)

> ⚠️ **Implemented before US1** — Products require a valid `category_id`. Categories must exist first.

**Goal**: Full CRUD for Category resource, including duplicate-name rejection.

**Independent Test**: Create a category → list it → update it → delete it. Verify 404 on unknown ID and 409 on duplicate name. All via `pytest app/categories/tests/`.

### Implementation

- [x] T007 [US2] Create `backend/app/categories/schemas.py` — define `CategoryCreate` (name required, description optional), `CategoryUpdate` (all optional), `CategoryRead` (id, name, description, created_at) with `model_config = ConfigDict(from_attributes=True)`
- [x] T008 [US2] Create `backend/app/categories/service.py` — in-memory store (`_store: dict[int, CategoryRead]`, `_counter: int`), implement: `create_category`, `list_categories`, `get_category`, `update_category`, `delete_category` — raise `AppException` with `CATEGORY_NOT_FOUND` (404) or `CATEGORY_ALREADY_EXISTS` (409) as appropriate; expose `reset_store()` for tests
- [x] T009 [US2] Create `backend/app/categories/router.py` — 5 endpoints per `contracts/categories.md`: `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — routers call service only, no logic
- [x] T010 [US2] Register categories router in `backend/app/main.py` under prefix `/api/v1/categories`

### Tests

- [x] T011 [US2] Create `backend/app/categories/tests/test_categories.py` — cover all acceptance scenarios from spec US2:
  - `test_create_category_success` → 201, returned data matches input
  - `test_list_categories_empty` → 200, returns `[]`
  - `test_list_categories_returns_all` → 200, list has correct count
  - `test_get_category_success` → 200, correct item returned
  - `test_get_category_not_found` → 404, code `CATEGORY_NOT_FOUND`
  - `test_update_category_success` → 200, updated field reflected
  - `test_update_category_not_found` → 404, code `CATEGORY_NOT_FOUND`
  - `test_delete_category_success` → 204, no body
  - `test_delete_category_not_found` → 404, code `CATEGORY_NOT_FOUND`
  - `test_create_category_duplicate_name` → 409, code `CATEGORY_ALREADY_EXISTS`
  - `test_create_category_missing_name` → 422

**Checkpoint**: `pytest app/categories/tests/` passes — all 11 tests green.

---

## Phase 4: User Story 1 — Manage Products (Priority: P1) 🎯 MVP

**Goal**: Full CRUD for Product resource, including `category_id` validation against existing categories.

**Independent Test**: Requires at least one category to exist. Create a product → list it → update price → delete it. Verify 404 on unknown product ID, 404 on invalid category_id, 422 on negative price. All via `pytest app/products/tests/`.

**Dependency**: Phase 3 must be complete (categories service must exist for `category_id` validation).

### Implementation

- [x] T012 [US1] Create `backend/app/products/schemas.py` — define `ProductCreate` (name, price, stock, category_id required; description optional), `ProductUpdate` (all optional), `ProductRead` (id, name, description, price, stock, category_id, created_at) with `model_config = ConfigDict(from_attributes=True)`
- [x] T013 [US1] Create `backend/app/products/service.py` — in-memory store (`_store: dict[int, ProductRead]`, `_counter: int`), implement: `create_product`, `list_products`, `get_product`, `update_product`, `delete_product` — on create/update with `category_id`, call categories service to verify it exists; raise `AppException` with `PRODUCT_NOT_FOUND` (404) or `CATEGORY_NOT_FOUND` (404) as appropriate; expose `reset_store()` for tests
- [x] T014 [US1] Create `backend/app/products/router.py` — 5 endpoints per `contracts/products.md`: `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — routers call service only, no logic
- [x] T015 [US1] Register products router in `backend/app/main.py` under prefix `/api/v1/products`

### Tests

- [x] T016 [US1] Create `backend/app/products/tests/test_products.py` — cover all acceptance scenarios from spec US1:
  - `test_create_product_success` → 201, returned data matches input
  - `test_list_products_empty` → 200, returns `[]`
  - `test_list_products_returns_all` → 200, list has correct count
  - `test_get_product_success` → 200, correct item returned
  - `test_get_product_not_found` → 404, code `PRODUCT_NOT_FOUND`
  - `test_update_product_success` → 200, updated fields reflected
  - `test_update_product_not_found` → 404, code `PRODUCT_NOT_FOUND`
  - `test_delete_product_success` → 204, no body
  - `test_delete_product_not_found` → 404, code `PRODUCT_NOT_FOUND`
  - `test_create_product_invalid_category` → 404, code `CATEGORY_NOT_FOUND`
  - `test_create_product_negative_price` → 422
  - `test_create_product_missing_name` → 422

**Checkpoint**: `pytest app/products/tests/` passes — all 12 tests green. Phase 1 MVP deliverable is now complete.

---

## Phase 5: User Story 3 — Manage Users (Priority: P3)

**Goal**: Full CRUD for User resource, including email format validation and uniqueness enforcement.

**Independent Test**: Fully standalone — no dependency on products or categories. Create a user → list → update name → delete. Verify 404 on unknown ID, 409 on duplicate email, 422 on bad email. All via `pytest app/users/tests/`.

### Implementation

- [x] T017 [P] [US3] Create `backend/app/users/schemas.py` — define `UserCreate` (full_name required, email required as `EmailStr`), `UserUpdate` (all optional, email as `Optional[EmailStr]`), `UserRead` (id, full_name, email, created_at) with `model_config = ConfigDict(from_attributes=True)`
- [x] T018 [US3] Create `backend/app/users/service.py` — in-memory store (`_store: dict[int, UserRead]`, `_counter: int`), implement: `create_user`, `list_users`, `get_user`, `update_user`, `delete_user` — enforce email uniqueness (case-insensitive); raise `AppException` with `USER_NOT_FOUND` (404) or `EMAIL_ALREADY_EXISTS` (409) as appropriate; expose `reset_store()` for tests
- [x] T019 [US3] Create `backend/app/users/router.py` — 5 endpoints per `contracts/users.md`: `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — routers call service only, no logic
- [x] T020 [US3] Register users router in `backend/app/main.py` under prefix `/api/v1/users`

### Tests

- [x] T021 [US3] Create `backend/app/users/tests/test_users.py` — cover all acceptance scenarios from spec US3:
  - `test_create_user_success` → 201, returned data matches input
  - `test_list_users_empty` → 200, returns `[]`
  - `test_list_users_returns_all` → 200, list has correct count
  - `test_get_user_success` → 200, correct item returned
  - `test_get_user_not_found` → 404, code `USER_NOT_FOUND`
  - `test_update_user_success` → 200, updated field reflected
  - `test_update_user_not_found` → 404, code `USER_NOT_FOUND`
  - `test_delete_user_success` → 204, no body
  - `test_delete_user_not_found` → 404, code `USER_NOT_FOUND`
  - `test_create_user_duplicate_email` → 409, code `EMAIL_ALREADY_EXISTS`
  - `test_create_user_invalid_email` → 422
  - `test_create_user_missing_name` → 422

**Checkpoint**: `pytest app/users/tests/` passes — all 12 tests green.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T022 Run full test suite from `backend/` with `pytest` — confirm all 35 tests pass (11 categories + 12 products + 12 users)
- [x] T023 [P] Verify interactive docs load at `http://localhost:8000/docs` — all 15 endpoints listed and functional
- [x] T024 [P] Validate edge cases from spec manually: empty list returns `[]` (not 404), non-integer ID returns 422, empty body returns 422

**Checkpoint**: All 35 tests pass, docs load, edge cases verified. Phase 1 complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 — BLOCKS all user story phases
- **Phase 3 (US2 Categories)**: Requires Phase 2 — no other story dependency
- **Phase 4 (US1 Products)**: Requires Phase 3 — Products need category_id validation
- **Phase 5 (US3 Users)**: Requires Phase 2 only — fully standalone, can run in parallel with Phase 3
- **Phase 6 (Polish)**: Requires all story phases complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|---|---|---|
| US2 Categories (P2) | Phase 2 | US3 Users |
| US1 Products (P1) | Phase 2 + US2 Categories | — |
| US3 Users (P3) | Phase 2 | US2 Categories |

> ⚠️ US1 (Products) has higher business priority (P1) but must be implemented after US2 (Categories) due to `category_id` dependency.

### Within Each Story

- Schemas → Service → Router → Register in main.py → Tests

### Parallel Opportunities

- T001, T002, T003 — all Phase 1 tasks can start in parallel
- T004, T005, T006 — Phase 2 tasks can start in parallel once Phase 1 is done
- T017 (users schemas) is marked [P] — can start as soon as Phase 2 is done, in parallel with Phase 3
- Once Phase 2 is done: US2 and US3 can be worked on simultaneously

---

## Parallel Example: Phase 2 + Early US3

```text
# Once Phase 1 is done, launch in parallel:
Task A: T004 - Create backend/app/core/exceptions.py
Task B: T005 - Create backend/app/main.py
Task C: T006 - Create backend/conftest.py

# Once Phase 2 is done, launch in parallel:
Task A (Phase 3): T007 - categories/schemas.py
Task B (Phase 5): T017 - users/schemas.py  ← US3 can start immediately
```

---

## Implementation Strategy

### MVP (Phases 1–4 only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: Categories (US2 — prerequisite)
4. Phase 4: Products (US1 — MVP core)
5. **STOP and validate**: `pytest` passes, `/docs` shows 10 endpoints
6. Deliver MVP

### Full Phase 1 Delivery

1. Complete MVP above
2. Phase 5: Users (US3)
3. Phase 6: Polish
4. Full 35-test suite passes

---

## Summary

| Metric | Value |
|---|---|
| Total tasks | 24 (T001–T024) |
| Setup tasks | 3 |
| Foundational tasks | 3 |
| US2 Categories tasks | 5 |
| US1 Products tasks | 5 |
| US3 Users tasks | 5 |
| Polish tasks | 3 |
| Total endpoints | 15 (3 resources × 5) |
| Total tests | 35 (11 + 12 + 12) |
| Parallel opportunities | T001–T003, T004–T006, T007+T017 |
