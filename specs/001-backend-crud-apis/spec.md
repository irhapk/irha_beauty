# Feature Specification: Backend CRUD APIs — Phase 1

**Feature Branch**: `001-backend-crud-apis`
**Created**: 2026-02-28
**Status**: Draft
**Input**: User description: "cover all user_stories, acceptance criteria and error handling."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Manage Products (Priority: P1)

An API client needs to create, view, update, and delete products in the Irha Beauty catalog. This is the core resource of the e-commerce platform.

**Why this priority**: Products are the central entity of any e-commerce system. No other feature is meaningful without the ability to manage products.

**Independent Test**: Can be fully tested by sending requests to the products endpoints and verifying correct data is returned or correct errors are raised.

**Acceptance Scenarios**:

1. **Given** the catalog is empty, **When** a client sends a valid create-product request, **Then** the product is stored and returned with a generated ID and status 201.
2. **Given** products exist, **When** a client requests all products, **Then** the full list is returned with status 200.
3. **Given** a product with ID 5 exists, **When** a client requests product ID 5, **Then** only that product is returned with status 200.
4. **Given** a product with ID 5 exists, **When** a client sends a valid update request for ID 5, **Then** the product is updated and the new data is returned with status 200.
5. **Given** a product with ID 5 exists, **When** a client sends a delete request for ID 5, **Then** the product is removed and status 204 is returned.
6. **Given** no product with ID 99 exists, **When** a client requests product ID 99, **Then** a 404 error with code `PRODUCT_NOT_FOUND` is returned.
7. **Given** a create request is missing a required field (e.g., name), **When** submitted, **Then** a 422 error with field-level detail is returned.
8. **Given** a create request contains a negative price, **When** submitted, **Then** a 422 error indicating invalid price is returned.

---

### User Story 2 — Manage Categories (Priority: P2)

An API client needs to create, view, update, and delete product categories (e.g., "Skincare", "Haircare", "Makeup").

**Why this priority**: Categories are needed to organize products. The product resource depends on categories being available.

**Independent Test**: Can be fully tested in isolation by sending requests to the categories endpoints without needing products to exist.

**Acceptance Scenarios**:

1. **Given** no categories exist, **When** a client sends a valid create-category request, **Then** the category is stored and returned with a generated ID and status 201.
2. **Given** categories exist, **When** a client requests all categories, **Then** the full list is returned with status 200.
3. **Given** a category with ID 2 exists, **When** a client requests category ID 2, **Then** only that category is returned with status 200.
4. **Given** a category with ID 2 exists, **When** a client sends a valid update for ID 2, **Then** the category is updated and the new data is returned with status 200.
5. **Given** a category with ID 2 exists, **When** a client sends a delete request for ID 2, **Then** the category is removed and status 204 is returned.
6. **Given** no category with ID 50 exists, **When** a client requests category ID 50, **Then** a 404 error with code `CATEGORY_NOT_FOUND` is returned.
7. **Given** a create request is missing the category name, **When** submitted, **Then** a 422 error with field-level detail is returned.
8. **Given** a category name already exists, **When** a client tries to create a duplicate, **Then** a 409 error with code `CATEGORY_ALREADY_EXISTS` is returned.

---

### User Story 3 — Manage Users (Priority: P3)

An API client needs to create, view, update, and delete user records (customers). No authentication is required in Phase 1 — this is basic data management only.

**Why this priority**: User records are needed to represent customers but are not a blocking dependency for products or categories.

**Independent Test**: Can be fully tested in isolation by sending requests to the users endpoints.

**Acceptance Scenarios**:

1. **Given** no users exist, **When** a client sends a valid create-user request with name and email, **Then** the user is stored and returned with a generated ID and status 201.
2. **Given** users exist, **When** a client requests all users, **Then** the full list is returned with status 200.
3. **Given** a user with ID 3 exists, **When** a client requests user ID 3, **Then** only that user is returned with status 200.
4. **Given** a user with ID 3 exists, **When** a client sends a valid update for ID 3, **Then** the user is updated and returned with status 200.
5. **Given** a user with ID 3 exists, **When** a client sends a delete request for ID 3, **Then** the user is removed and status 204 is returned.
6. **Given** no user with ID 100 exists, **When** a client requests user ID 100, **Then** a 404 error with code `USER_NOT_FOUND` is returned.
7. **Given** a create request contains an invalid email format, **When** submitted, **Then** a 422 error indicating invalid email is returned.
8. **Given** an email already exists in the system, **When** a client tries to register a new user with that email, **Then** a 409 error with code `EMAIL_ALREADY_EXISTS` is returned.

---

### Edge Cases

- What happens when a request body is empty (`{}`)? → 422 validation error listing all missing required fields.
- What happens when an ID in the URL is not an integer (e.g., `/products/abc`)? → 422 validation error indicating invalid ID type.
- What happens when an update request provides no fields? → 422 validation error; at least one field must be provided.
- What happens when the product price is zero? → Accepted as valid (free items are allowed).
- What happens when a string field exceeds maximum length? → 422 validation error with field-specific message.
- What happens when the list endpoint is called and no records exist? → 200 with an empty list `[]`, never 404.

---

## Requirements *(mandatory)*

### Functional Requirements

**Products**

- **FR-001**: System MUST allow creating a product with name, description, price, stock quantity, and category ID.
- **FR-002**: System MUST return all products as a list.
- **FR-003**: System MUST return a single product by ID.
- **FR-004**: System MUST allow updating any product field by ID.
- **FR-005**: System MUST allow deleting a product by ID.
- **FR-006**: System MUST reject product creation if name is missing or price is negative.
- **FR-007**: System MUST return `PRODUCT_NOT_FOUND` (404) when a product ID does not exist.

**Categories**

- **FR-008**: System MUST allow creating a category with a name and optional description.
- **FR-009**: System MUST return all categories as a list.
- **FR-010**: System MUST return a single category by ID.
- **FR-011**: System MUST allow updating a category by ID.
- **FR-012**: System MUST allow deleting a category by ID.
- **FR-013**: System MUST reject duplicate category names with `CATEGORY_ALREADY_EXISTS` (409).
- **FR-014**: System MUST return `CATEGORY_NOT_FOUND` (404) when a category ID does not exist.

**Users**

- **FR-015**: System MUST allow creating a user with full name and email address.
- **FR-016**: System MUST return all users as a list.
- **FR-017**: System MUST return a single user by ID.
- **FR-018**: System MUST allow updating a user by ID.
- **FR-019**: System MUST allow deleting a user by ID.
- **FR-020**: System MUST validate email format on create and update.
- **FR-021**: System MUST reject duplicate emails with `EMAIL_ALREADY_EXISTS` (409).
- **FR-022**: System MUST return `USER_NOT_FOUND` (404) when a user ID does not exist.

**General API Behaviour**

- **FR-023**: System MUST return a uniform error envelope `{ "detail": "...", "code": "SCREAMING_SNAKE" }` for all 4xx errors.
- **FR-024**: System MUST return an empty list `[]` (not 404) when a list endpoint has no records.
- **FR-025**: All IDs must be auto-incremented integers assigned by the system — never supplied by the client.

### Key Entities

- **Product**: Represents a sellable item. Key attributes: ID, name, description, price (non-negative), stock quantity (non-negative integer), category ID, created date.
- **Category**: Represents a product grouping. Key attributes: ID, name (unique), description (optional), created date.
- **User**: Represents a customer account. Key attributes: ID, full name, email (unique, valid format), created date.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All CRUD operations for all three resources (Products, Categories, Users) return correct responses for both success and error scenarios — 100% of defined acceptance scenarios pass.
- **SC-002**: Every 4xx error response includes a `detail` message and a `code` in `SCREAMING_SNAKE` format — 0 unformatted error responses.
- **SC-003**: List endpoints always return a list (empty or populated) — never a 404 for empty collections.
- **SC-004**: Invalid input (missing required fields, wrong types, constraint violations) is caught and reported at the boundary before reaching business logic — 100% of invalid requests return 422 or 409 as appropriate.
- **SC-005**: Every endpoint has at least one passing automated test covering the happy path and at least one error path.
- **SC-006**: A new developer can run all tests and get a passing suite with a single command.
