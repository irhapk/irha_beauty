# Spec: 006-schema-extension — Backend Schema Extension

**Feature**: 006-schema-extension
**Branch**: 006-schema-extension
**Status**: Approved
**Version**: 1.0.0
**Date**: 2026-03-02

---

## Problem

The frontend currently uses a static-data bridge (`static-data.ts` + `product-mapper.ts`) because
the backend schema lacks `slug`, `image`, `hover_image`, `status`, `banner_image`, and
`category_image` fields. Every product and category page hard-codes its visual data in TypeScript.

---

## Goal

Extend the backend database schema so the frontend can fetch live, complete data from the API and
retire the static bridge as the source of truth for pages.

---

## Functional Requirements

### Backend

- FR-01: `categories` table gains 4 new columns: `slug` (VARCHAR 120), `status` (VARCHAR 20), `banner_image` (VARCHAR 500), `category_image` (VARCHAR 500)
- FR-02: `products` table gains 3 new columns: `slug` (VARCHAR 220), `image` (VARCHAR 500), `hover_image` (VARCHAR 500)
- FR-03: `CategoryRead` API response includes all 4 new fields
- FR-04: `ProductRead` API response includes all 3 new fields
- FR-05: `CategoryCreate` accepts optional new fields (defaults: slug="", status="active", banner_image="", category_image="")
- FR-06: `ProductCreate` accepts optional new fields (defaults: slug="", image="", hover_image="")
- FR-07: `CategoryUpdate` accepts optional nullable updates for new fields
- FR-08: `ProductUpdate` accepts optional nullable updates for new fields
- FR-09: Alembic migration `c3d4e5f6a7b8` chains from `b2c3d4e5f6a7`, all new columns `NOT NULL DEFAULT ''` (status defaults to `'active'`)

### Frontend

- FR-10: Homepage (`app/page.tsx`) fetches live categories from `GET /api/v1/categories`
- FR-11: Homepage fetches live products from `GET /api/v1/products`
- FR-12: Category pages use live banner + status from API
- FR-13: `product-mapper.ts` adds `BackendCategory` interface + `enrichCategory()` + `enrichCategories()`
- FR-14: `enrichProduct()` reads `slug`, `image`, `hover_image` directly from backend response
- FR-15: `static-data.ts` is no longer the source of truth for pages; it remains as last-resort fallback inside mappers only

---

## Non-Functional Requirements

- NFR-01: All existing 49 backend tests continue to pass
- NFR-02: Next.js build remains clean (no type errors, no missing image warnings)
- NFR-03: NeonDB migration applied via SQL Editor (Railway auto-runs `alembic upgrade head`)
- NFR-04: API fallback to static data if backend is unreachable (graceful degradation)
- NFR-05: `next: { revalidate: 60 }` on all API fetches (ISR, 60-second cache)

---

## Out of Scope

- Admin UI for editing category/product images
- Multiple product images / gallery
- New API endpoints (reuses existing `/categories` and `/products`)
- Category slug join in product API (deferred — category field on Product still uses static map as fallback)
- Stripe payments, reviews, search/filter

---

## Acceptance Criteria

- [ ] `GET /api/v1/categories` returns `slug`, `status`, `banner_image`, `category_image` fields
- [ ] `GET /api/v1/products` returns `slug`, `image`, `hover_image` fields
- [ ] `alembic_version` in NeonDB = `c3d4e5f6a7b8`
- [ ] All 49 backend tests pass (`pytest --tb=short -q`)
- [ ] Frontend build clean (`npm run build`)
- [ ] Homepage loads category images from API (Network tab: `/api/v1/categories` returns 4 items with images)
- [ ] `/categories/facewash` banner renders from API data
