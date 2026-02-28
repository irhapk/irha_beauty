# Feature Specification: Database Connection — Phase 2

**Feature Branch**: `002-db-connection`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "phase 02(db connection)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Data Persists Across Restarts (Priority: P1)

As a developer running the Irha Beauty API, I need all data created through the API (products, categories, users) to be permanently saved so that restarting the server does not wipe everything out.

**Why this priority**: This is the entire point of Phase 2. In Phase 1, all data lived in memory and vanished on every restart. Persistent storage is the foundational requirement that everything else depends on.

**Independent Test**: Start the server, create a category via POST, restart the server, call GET for that category — it must still exist. This alone proves persistence works.

**Acceptance Scenarios**:

1. **Given** the API is running and has data in it, **When** the server is restarted, **Then** all previously created categories, products, and users are returned correctly by their GET endpoints.
2. **Given** the API is running with an empty database, **When** a POST request creates a new resource, **Then** the resource is retrievable immediately and remains retrievable after a server restart.
3. **Given** a resource was deleted via DELETE, **When** the server is restarted, **Then** the deleted resource remains gone and returns 404.

---

### User Story 2 - All Existing API Behaviour Preserved (Priority: P1)

As a frontend developer consuming the Irha Beauty API, I need every endpoint to return the exact same responses, status codes, and error envelopes it did in Phase 1, so that switching to a real database is invisible to API consumers.

**Why this priority**: Shared priority with US1 — the database swap must be a zero-breaking-change migration. All 35 existing tests must pass without modification. No contract changes allowed.

**Independent Test**: Run the full Phase 1 test suite (35 tests) against the Phase 2 implementation without changing a single test file. All 35 must pass.

**Acceptance Scenarios**:

1. **Given** the Phase 2 API is running, **When** any of the 15 endpoints is called with the same inputs as Phase 1 tests, **Then** the response status code, body shape, and error code are identical to Phase 1 behaviour.
2. **Given** a request is made with invalid data (missing required field, wrong type, negative price), **When** the API validates the input, **Then** it returns 422 exactly as before.
3. **Given** a request targets a non-existent resource, **When** the API processes it, **Then** it returns 404 with the same error code (`PRODUCT_NOT_FOUND`, `CATEGORY_NOT_FOUND`, `USER_NOT_FOUND`).
4. **Given** a duplicate is submitted (duplicate category name, duplicate user email), **When** the API checks uniqueness, **Then** it returns 409 with the same error code (`CATEGORY_ALREADY_EXISTS`, `EMAIL_ALREADY_EXISTS`).

---

### User Story 3 - Data Integrity Enforced at Storage Level (Priority: P2)

As the system owner, I need the database itself to enforce data integrity constraints (unique names, valid foreign keys, required fields) so that invalid data can never exist in storage even if application-layer checks are bypassed.

**Why this priority**: P2 because it is a resilience and correctness concern. The API already enforces these in service layer, but having the storage layer also enforce them ensures no bug or future code path can silently corrupt data.

**Independent Test**: Can be verified by checking that the storage schema defines unique constraints on category name and user email, and a foreign key from product to category. These are structural properties provable without running the full API.

**Acceptance Scenarios**:

1. **Given** two categories with the same name exist in storage, **When** the data layer is inspected, **Then** the storage engine rejects this as a violation of a uniqueness constraint.
2. **Given** a product references a category_id that does not exist, **When** the data layer attempts to save it, **Then** the storage engine rejects it as a foreign key violation.
3. **Given** a required field (e.g., category name, product name, user email) is missing, **When** the data layer attempts to save it, **Then** the storage engine rejects it with a not-null violation.

---

### Edge Cases

- What happens when the database is unreachable at startup? The server must fail fast with a clear error, not silently serve stale data.
- What happens when a database constraint is violated by the application layer (e.g., race condition on duplicate email)? The API must catch the storage-level error and return the correct 409 response — not a 500.
- What happens when a migration has not been applied and the schema is out of sync? The API must not start, or must surface a clear error.
- What happens when a DELETE is called on a category that has products referencing it? The behaviour (cascade delete or 409 error) must be defined explicitly and not left to chance.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist all created resources (categories, products, users) to a durable external data store that survives server restarts.
- **FR-002**: System MUST enforce uniqueness of category names at the storage level, rejecting duplicates even if the application layer fails to check.
- **FR-003**: System MUST enforce uniqueness of user email addresses (case-insensitive) at the storage level.
- **FR-004**: System MUST enforce that every product references a valid, existing category — rejected at both application and storage levels.
- **FR-005**: System MUST enforce required fields (category name, product name and price, user full_name and email) at the storage level.
- **FR-006**: System MUST NOT change any existing API contracts — all 15 endpoints must return the same status codes, response shapes, and error envelopes as Phase 1.
- **FR-007**: System MUST run all 35 Phase 1 tests without modification to any test file.
- **FR-008**: System MUST expose a mechanism for tests to run in isolation — each test's data changes must not affect other tests.
- **FR-009**: System MUST load all sensitive configuration (database connection string) from environment variables — no secrets in source code.
- **FR-010**: System MUST apply schema changes through a versioned migration system — no direct schema creation at runtime.
- **FR-011**: System MUST catch storage-level constraint violations (duplicate key, foreign key failure) and translate them into the correct HTTP error responses (409 for uniqueness, 404 for missing foreign key).
- **FR-012**: System MUST use a separate database instance for tests to prevent test data from affecting the production database.
- **FR-013**: System MUST use asynchronous database access to maintain the non-blocking nature of the existing API.
- **FR-014**: System MUST auto-assign `id` and `created_at` values at the storage level, not at the application layer.
- **FR-015**: System MUST define the delete behaviour for categories that have associated products (cascade or restrict) and enforce it consistently.

### Key Entities

- **Category**: Represents a product grouping. Fields: id (auto), name (unique, required), description (optional), created_at (auto). Has many Products.
- **Product**: Represents a purchasable item. Fields: id (auto), name (required), description (optional), price (positive number, required), stock (non-negative integer, required), category_id (required, FK to Category), created_at (auto). Belongs to one Category.
- **User**: Represents a registered customer. Fields: id (auto), full_name (required), email (unique case-insensitive, required), created_at (auto).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 35 Phase 1 tests pass without any modification to test files after Phase 2 is implemented.
- **SC-002**: Data created through the API survives a server restart — verified by creating a resource, restarting, and retrieving it successfully.
- **SC-003**: Storage-level constraints (unique, not-null, foreign key) are present and enforced — verified by schema inspection or direct constraint-violation attempt.
- **SC-004**: All test runs are isolated — running the full suite multiple times in sequence produces the same results with no cross-test contamination.
- **SC-005**: No secrets (database credentials) appear in any committed source file — verified by scanning committed files.
- **SC-006**: The schema is managed entirely through versioned migrations — no `create_all()` or equivalent runtime schema creation call exists in production code.
