# Plan: 006-schema-extension — Backend Schema Extension

**Feature**: 006-schema-extension
**Branch**: 006-schema-extension
**Date**: 2026-03-02

---

## Architecture Decisions

### AD-01: Alembic Migration Chain
- New migration ID: `c3d4e5f6a7b8`
- Revises: `b2c3d4e5f6a7` (add_email_to_orders)
- All new string columns: `NOT NULL DEFAULT ''` — safe for existing rows, no data loss
- `status` column: `VARCHAR(20) NOT NULL DEFAULT 'active'`

### AD-02: Column Defaults Strategy
- Use `server_default=''` (SQLAlchemy ORM) + `DEFAULT ''` (Alembic SQL) for all string fields
- This ensures both ORM and raw SQL are consistent
- Existing rows get empty strings / 'active' — no NULL issues

### AD-03: Frontend Fallback Strategy
- `enrichCategory()` falls back to STATIC_CATEGORIES by ID if backend field is empty
- `enrichProduct()` falls back to FEATURED_PRODUCTS by ID if backend slug/image is empty
- `static-data.ts` stays in codebase as seed reference + emergency fallback
- Pages no longer import `static-data.ts` directly

### AD-04: Category Field on Product
- Backend returns `category_id` (integer), not category slug
- `enrichProduct()` keeps static `CATEGORY_SLUG_MAP` fallback for now
- Full join deferred to a future phase when the product API endpoint is extended

### AD-05: ISR Cache
- All `fetch()` calls use `next: { revalidate: 60 }` — 60-second ISR
- Fresh data on every new build + after 60s stale window in production

### AD-06: generateStaticParams Safety
- `categories/[slug]/page.tsx` keeps `STATIC_CATEGORIES` as `generateStaticParams` source
- This ensures build-time pre-rendering works even when backend is cold at build time
- `getCategoryBySlug()` fetches live at runtime for category metadata

---

## Affected Files

| Layer | File | Change |
|---|---|---|
| Backend model | `backend/app/categories/models.py` | +4 columns |
| Backend model | `backend/app/products/models.py` | +3 columns |
| Backend schema | `backend/app/categories/schemas.py` | +fields on Read/Create/Update |
| Backend schema | `backend/app/products/schemas.py` | +fields on Read/Create/Update |
| Backend migration | `backend/alembic/versions/c3d4e5f6a7b8_extend_categories_and_products.py` | NEW |
| Frontend mapper | `frontend/lib/product-mapper.ts` | BackendCategory + enrichCategory + updated enrichProduct |
| Frontend page | `frontend/app/page.tsx` | fetch live categories + products from API |
| Frontend page | `frontend/app/categories/[slug]/page.tsx` | getCategoryBySlug from API |

---

## NeonDB SQL (user runs in SQL Editor)

```sql
-- Migration 5: extend categories and products
ALTER TABLE categories ADD COLUMN slug VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE categories ADD COLUMN banner_image VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN category_image VARCHAR(500) NOT NULL DEFAULT '';

ALTER TABLE products ADD COLUMN slug VARCHAR(220) NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN image VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN hover_image VARCHAR(500) NOT NULL DEFAULT '';

UPDATE alembic_version SET version_num = 'c3d4e5f6a7b8';

-- Seed existing categories
UPDATE categories SET slug='shampoo',   status='coming-soon', banner_image='/shampoo_banner.png',   category_image='/shampoo_category.png'   WHERE id=1;
UPDATE categories SET slug='oils',      status='coming-soon', banner_image='/oil_banner.png',       category_image='/oil_category.png'       WHERE id=2;
UPDATE categories SET slug='fragrance', status='coming-soon', banner_image='/fragrance_banner.png', category_image='/fragrance_category.png' WHERE id=3;
UPDATE categories SET slug='facewash',  status='active',      banner_image='/facewash_banner.png',  category_image='/facewash_category.png'  WHERE id=4;

-- Seed existing products
UPDATE products SET slug='oil-control-facewash', image='/shampoo_one.png', hover_image='/shampoo_two.png' WHERE id=1;
```

> Railway auto-runs `alembic upgrade head` on start — this migration will be applied automatically
> to Railway's DATABASE_URL (same NeonDB). No extra Railway action needed beyond the SQL seed above.

---

## Verification

1. `GET /api/v1/categories` → includes `slug`, `status`, `banner_image`, `category_image`
2. `GET /api/v1/products` → includes `slug`, `image`, `hover_image`
3. `SELECT * FROM alembic_version;` → `c3d4e5f6a7b8`
4. `cd backend && .venv312/Scripts/pytest --tb=short -q` → 49/49 green
5. `cd frontend && npm run build` → clean
6. Homepage Network tab: `/api/v1/categories` returns 4 items with images
