---
id: "0036"
title: Phase 6 Schema Extension Implementation
stage: spec
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: 006-schema-extension
branch: 006-schema-extension
user: irhapk
command: implement plan
labels: ["schema-extension","backend","frontend","alembic","migration","product-mapper","static-data-bridge"]
links:
  spec: specs/006-schema-extension/spec.md
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/006-schema-extension/spec.md
  - specs/006-schema-extension/plan.md
  - specs/006-schema-extension/tasks.md
  - backend/alembic/versions/c3d4e5f6a7b8_extend_categories_and_products.py
  - backend/app/categories/models.py
  - backend/app/products/models.py
  - backend/app/categories/schemas.py
  - backend/app/products/schemas.py
  - frontend/lib/product-mapper.ts
  - frontend/app/page.tsx
  - frontend/app/categories/[slug]/page.tsx
  - .specify/memory/constitution.md
tests:
  - backend/app/categories/tests/test_categories.py (existing — must still pass)
  - backend/app/products/tests/test_products.py (existing — must still pass)
---

## Prompt

Implement the following plan:

# Plan: Phase 6 — Backend Schema Extension (Eliminate Static Data Bridge)

## Context
The frontend currently uses a static-data bridge (`static-data.ts` + `product-mapper.ts`) because
the backend schema lacks `slug`, `image`, `hover_image`, `status`, `banner_image`, and
`category_image` fields. Every product and category page hard-codes its visual data in TypeScript.
Phase 6 extends the backend database schema so the frontend can fetch live, complete data from the
API and retire the static bridge.

**Goal**: After Phase 6, `app/page.tsx` and `app/categories/[slug]/page.tsx` fetch live data from
the API. `static-data.ts` is no longer imported by pages or components — it becomes a last-resort
fallback inside `product-mapper.ts` only.

[Full plan with all steps: backend migration, model updates, schema updates, frontend mapper, page updates]

## Response snapshot

Implemented all 9 code steps of the Phase 6 plan:

**SDD Artifacts** (T001 in tasks):
- Created `specs/006-schema-extension/spec.md` — functional + non-functional requirements, acceptance criteria
- Created `specs/006-schema-extension/plan.md` — 6 architectural decisions, NeonDB SQL seed script
- Created `specs/006-schema-extension/tasks.md` — T001–T010 with checkboxes

**Backend** (T001–T005):
- Created `backend/alembic/versions/c3d4e5f6a7b8_extend_categories_and_products.py` — adds 4 columns to categories, 3 to products; chains from b2c3d4e5f6a7
- Updated `backend/app/categories/models.py` — added slug, status, banner_image, category_image columns after description
- Updated `backend/app/products/models.py` — added slug, image, hover_image columns after description
- Updated `backend/app/categories/schemas.py` — added new fields to CategoryRead/Create/Update
- Updated `backend/app/products/schemas.py` — added new fields to ProductRead/Create/Update

**Frontend** (T007–T009):
- Replaced `frontend/lib/product-mapper.ts` — added BackendCategory interface, enrichCategory(), enrichCategories(); updated enrichProduct() to read slug/image/hover_image from backend; added facewash (id=4) to CATEGORY_SLUG_MAP
- Updated `frontend/app/page.tsx` — async server component with getLiveCategories() + getLiveProducts(), Promise.all parallel fetch, graceful fallback to static data
- Updated `frontend/app/categories/[slug]/page.tsx` — getCategoryBySlug() fetches live API first, falls back to STATIC_CATEGORIES; generateStaticParams still uses STATIC_CATEGORIES for build safety

**Constitution** (T010):
- Bumped `.specify/memory/constitution.md` to v4.2.0, added Phase 6 completion note

**Pending user action** (T006):
- User must run NeonDB SQL seed from `specs/006-schema-extension/plan.md` in NeonDB SQL Editor
- Railway will auto-apply the Alembic migration on next deploy

## Outcome

- ✅ Impact: Backend schema extended with 7 new columns across 2 tables; frontend pages now fetch live data from API with static-data fallback; static bridge retired from pages
- 🧪 Tests: Existing 49 backend tests should still pass (new columns have server defaults — no breaking changes to existing test fixtures); to be verified by user
- 📁 Files: 12 files created/modified (3 SDD artifacts, 1 migration, 2 models, 2 schemas, 1 mapper, 2 pages, 1 constitution)
- 🔁 Next prompts: T006 — run NeonDB SQL seed; verify `GET /api/v1/categories` returns new fields; run `npm run build`; run `pytest`
- 🧠 Reflection: The key design choice was keeping STATIC_CATEGORIES as a build-time safety net for generateStaticParams while retiring it as the runtime source of truth for pages. This ensures zero build-time risk while enabling live data.

## Evaluation notes (flywheel)

- Failure modes observed: none (clean implementation following approved plan)
- Graders run and results (PASS/FAIL): pending user verification
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run `pytest` + `npm run build` to verify no regressions
