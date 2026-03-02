# Tasks: 006-schema-extension — Backend Schema Extension

**Feature**: 006-schema-extension
**Branch**: 006-schema-extension
**Date**: 2026-03-02

---

## T001 — Create Alembic migration `c3d4e5f6a7b8`

**File**: `backend/alembic/versions/c3d4e5f6a7b8_extend_categories_and_products.py`

- [ ] Revision ID: `c3d4e5f6a7b8`
- [ ] `down_revision`: `b2c3d4e5f6a7`
- [ ] `upgrade()`: adds 4 columns to `categories`, 3 to `products`
- [ ] `downgrade()`: drops all 7 columns in reverse order
- [ ] All new columns `NOT NULL` with `server_default`

---

## T002 — Update `Category` model

**File**: `backend/app/categories/models.py`

- [ ] Add `slug: Mapped[str]` — `String(120)`, nullable=False, server_default=""
- [ ] Add `status: Mapped[str]` — `String(20)`, nullable=False, server_default="active"
- [ ] Add `banner_image: Mapped[str]` — `String(500)`, nullable=False, server_default=""
- [ ] Add `category_image: Mapped[str]` — `String(500)`, nullable=False, server_default=""
- [ ] Columns placed after `description`, before `created_at`

---

## T003 — Update `Product` model

**File**: `backend/app/products/models.py`

- [ ] Add `slug: Mapped[str]` — `String(220)`, nullable=False, server_default=""
- [ ] Add `image: Mapped[str]` — `String(500)`, nullable=False, server_default=""
- [ ] Add `hover_image: Mapped[str]` — `String(500)`, nullable=False, server_default=""
- [ ] Columns placed after `description`, before `price`/`stock`/`category_id`

---

## T004 — Update `CategoryRead/Create/Update` schemas

**File**: `backend/app/categories/schemas.py`

- [ ] `CategoryRead`: add `slug: str`, `status: str`, `banner_image: str`, `category_image: str`
- [ ] `CategoryCreate`: add `slug: str = ""`, `status: str = "active"`, `banner_image: str = ""`, `category_image: str = ""`
- [ ] `CategoryUpdate`: add `slug: str | None = None`, `status: str | None = None`, `banner_image: str | None = None`, `category_image: str | None = None`

---

## T005 — Update `ProductRead/Create/Update` schemas

**File**: `backend/app/products/schemas.py`

- [ ] `ProductRead`: add `slug: str`, `image: str`, `hover_image: str`
- [ ] `ProductCreate`: add `slug: str = ""`, `image: str = ""`, `hover_image: str = ""`
- [ ] `ProductUpdate`: add `slug: str | None = None`, `image: str | None = None`, `hover_image: str | None = None`

---

## T006 — Apply migration SQL to NeonDB + seed existing rows

**Action**: User runs SQL in NeonDB console

- [ ] Run `ALTER TABLE categories ...` (4 new columns)
- [ ] Run `ALTER TABLE products ...` (3 new columns)
- [ ] Run `UPDATE alembic_version SET version_num = 'c3d4e5f6a7b8'`
- [ ] Seed categories 1–4 with slug, status, banner_image, category_image
- [ ] Seed product id=1 with slug, image, hover_image
- [ ] Verify: `SELECT slug, status, banner_image, category_image FROM categories;`
- [ ] Verify: `SELECT slug, image, hover_image FROM products;`

SQL is in `specs/006-schema-extension/plan.md`.

---

## T007 — Update `product-mapper.ts`

**File**: `frontend/lib/product-mapper.ts`

- [ ] Add `BackendCategory` interface with all backend fields
- [ ] Add `enrichCategory(bc: BackendCategory): Category` — maps backend fields, falls back to staticMatch
- [ ] Add `enrichCategories(bcs: BackendCategory[]): Category[]` — maps array
- [ ] Update `BackendProduct` interface to include `slug`, `image`, `hover_image`
- [ ] Update `enrichProduct()` to read `slug`, `image`, `hover_image` from backend response
- [ ] Retain `CATEGORY_SLUG_MAP` fallback for `category` field (category_id based)
- [ ] No breaking changes to exported `enrichProducts()` function signature

---

## T008 — Update `app/page.tsx` to fetch live data

**File**: `frontend/app/page.tsx`

- [ ] Convert to `async` server component
- [ ] Add `getLiveCategories()` — fetches `GET /api/v1/categories`, enriches, falls back to STATIC_CATEGORIES
- [ ] Add `getLiveProducts()` — fetches `GET /api/v1/products`, enriches, falls back to FEATURED_PRODUCTS
- [ ] Run both fetches in parallel via `Promise.all`
- [ ] Pass live `categories` to `<CategoryGrid>` and live `products` to `<FeaturedProducts>`
- [ ] Remove direct `STATIC_CATEGORIES` / `FEATURED_PRODUCTS` imports from page (keep as fallback inside helpers only)

---

## T009 — Update `app/categories/[slug]/page.tsx`

**File**: `frontend/app/categories/[slug]/page.tsx`

- [ ] Add `getCategoryBySlug(slug)` — fetches live API, enriches, falls back to STATIC_CATEGORIES
- [ ] Update `CategoryPage` to use `getCategoryBySlug(slug)` instead of `STATIC_CATEGORIES.find(...)`
- [ ] `generateStaticParams` keeps STATIC_CATEGORIES (build-time safety — no changes needed)
- [ ] `generateMetadata` uses `getCategoryBySlug` for live category name
- [ ] Import `BackendCategory`, `enrichCategories` from `product-mapper`

---

## T010 — Verify + Create PHR 0036

- [ ] Run `cd backend && .venv312/Scripts/pytest --tb=short -q` → 49/49 pass
- [ ] Run `cd frontend && npm run build` → clean build
- [ ] Verify `GET /api/v1/categories` returns 4 items with new fields (curl or browser)
- [ ] Verify `GET /api/v1/products` returns products with new fields
- [ ] Create PHR 0036 at `history/prompts/006-schema-extension/0036-phase6-schema-extension.spec.prompt.md`
- [ ] Update MEMORY.md: PHR last ID = 0036, feature 006 status = IN PROGRESS
