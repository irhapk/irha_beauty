---
id: "0008"
title: Phase 5 US3 Restrict Delete Green
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 002-db-connection
branch: 002-db-connection
user: PC
command: /sp.implement phase 05
labels: ["green","phase-5","us3","restrict","delete","integrity","categories","service"]
links:
  spec: specs/002-db-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/categories/service.py (RESTRICT check added to delete_category)
  - backend/app/categories/tests/test_categories.py (test_delete_category_with_products added)
tests:
  - 36/36 passed in 1.64s
---

## Prompt

/sp.implement phase 05

## Response snapshot

Implemented Phase 5 (T025–T026): DB integrity RESTRICT check for category deletion.

**T025 — `categories/service.py`**:
Added two lines before `repository.delete_category()`:
```python
count = await repository.count_products_by_category(db, category_id)
if count > 0:
    raise AppException(detail="Cannot delete category with associated products",
        code="CATEGORY_HAS_PRODUCTS", status_code=409)
```
`count_products_by_category` was already implemented in T011 (Phase 3).

**T026 — `test_delete_category_with_products`**:
Test flow: create category → create product in it → DELETE category (assert 409 CATEGORY_HAS_PRODUCTS) → DELETE product → DELETE category (assert 204).

Full suite: **36/36 passed in 1.64s**.

## Outcome

- ✅ Impact: US3 fully implemented. Deleting a category that still has products returns 409. This prevents orphaned products and enforces referential integrity at the application layer (complementing the FK ON DELETE RESTRICT at the DB layer).
- 🧪 Tests: 36/36 passed in 1.64s
- 📁 Files: 2 files modified
- 🔁 Next prompts: `/sp.implement phase 06` — final polish, full suite verification, manual persistence check, docs
- 🧠 Reflection: The `count_products_by_category` function in the repository was already built in T011, so T025 was a clean 6-line addition to the service. This is the payoff of the layered architecture: business rules live in the service, DB queries in the repository.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): pytest 36/36 PASS
- Prompt variant (if applicable): phase 05
- Next experiment: n/a
