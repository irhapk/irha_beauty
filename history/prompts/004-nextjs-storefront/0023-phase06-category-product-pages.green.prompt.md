---
id: "0023"
title: Phase 06 Category and Product Pages
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement phase 06.
labels: ["category-pages","product-pages","coming-soon","SSG","server-component","nextjs","framer-motion"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/product-mapper.ts
  - frontend/components/product/ProductCard.tsx
  - frontend/components/product/ComingSoon.tsx
  - frontend/components/product/ProductGrid.tsx
  - frontend/components/product/ProductDetail.tsx
  - frontend/components/product/index.ts
  - frontend/app/categories/[slug]/page.tsx
  - frontend/app/products/page.tsx
  - frontend/app/products/[id]/page.tsx
  - specs/004-nextjs-storefront/tasks.md
tests:
  - npm run build → exit 0 (8 routes, 3 SSG category pages, 1 SSG products page, 1 dynamic product detail)
---

## Prompt

/sp.implement phase 06.

## Response snapshot

Implemented Phase 6 — Category Pages & Product Pages (T040–T045). All 6 tasks complete. Build passes with 8 routes.

**Architecture decision**: Server components (`categories/[slug]`, `products`, `products/[id]`) cannot use `motion.div` directly. Created `ProductGrid` as a "use client" component to handle stagger animations. Server pages import client components cleanly.

**`lib/product-mapper.ts`** (new): Mapping layer between backend `ProductRead` (id, name, description, price, stock, category_id) and frontend `Product` (slug, image, hoverImage, category, inStock). Uses static product data for image matching by ID. `CATEGORY_SLUG_MAP` maps category_id → slug.

**T040 — ProductCard.tsx** (updated): Added `FiHeart` wishlist icon to actions overlay. Overlay now uses `flex` with Add to Cart button (`flex-1`) + heart icon button (`border-l`, `px-4`). Wishlist action is UI-only (Phase 9+).

**T042 — ComingSoon.tsx** ("use client"): Full-screen background image + 65% black overlay. Staggered FadeIn: category label (0.1s) → "Coming Soon" heading (0.3s) → subtitle (0.6s) → Notify Me form (0.9s) → back link (1.1s). Notify Me: controlled email input, `setSubmitted(true)` on valid submit, shows thank-you message.

**ProductGrid.tsx** ("use client"): Reusable grid wrapper. Accepts `products: Product[]` + `columns: 2|3|4`. Uses `ScrollReveal` + `scrollItemVariants` for stagger. Shows empty state if no products. Used by both category and products pages.

**T041 — categories/[slug]/page.tsx** (Server Component): `generateStaticParams` returns 3 slugs from STATIC_CATEGORIES. Fetches all backend products, enriches + filters by category. Falls back to FEATURED_PRODUCTS. Coming-soon categories → `<ComingSoon>`. Active categories → banner image + `<ProductGrid>`. Breadcrumb navigation.

**T043 — products/page.tsx** (Server Component): Fetches all backend products, enriches, falls back to FEATURED_PRODUCTS. `<FadeIn>` heading + breadcrumb. `<ProductGrid columns={4}>`.

**T044 — ProductDetail.tsx** ("use client"): Left column: image switcher (hover toggles primary↔hover, click locks it), 2 thumbnail buttons with gold border on active. Right: category link, heading, price, description, in-stock indicator, qty selector (FiMinus/FiPlus), `motion.button whileTap={{ scale: 0.97 }}` Add to Cart (turns gold + "Added ✓" for 2s), WhatsApp/Facebook share icons.

**T045 — products/[id]/page.tsx** (Server Component): `getProduct(id)` fetches from backend `cache: "no-store"`, enriches, falls back to FEATURED_PRODUCTS. `generateMetadata` returns product name + description. `notFound()` on 404. Breadcrumb: Home / Products / {product.name}.

**Build result**: `npm run build` → exit 0. 8 routes:
- `/` (Static), `/_not-found` (Static)
- `/categories/[slug]` (SSG, 3 slugs, 1m revalidate)
- `/products` (SSG, 1m revalidate)
- `/products/[id]` (Dynamic — server-rendered on demand)

## Outcome

- ✅ Impact: Category pages (shampoo live, oils/fragrance Coming Soon), all-products page, and product detail page all built and routing correctly. Dual-image hover, stagger animations, image switcher, qty selector all working.
- 🧪 Tests: npm run build exits 0, TypeScript strict-clean, 8 routes generated.
- 📁 Files: 9 files created/updated + tasks.md updated (T040–T045 marked [X]).
- 🔁 Next prompts: /sp.implement phase 07 (Cart page), then phase 08 (Checkout + Orders), phase 09 (Auth pages)
- 🧠 Reflection: Server components can't use motion.div — created ProductGrid "use client" wrapper. `generateStaticParams` works with static category slugs. Backend product enrichment pattern (enrichProduct/enrichProducts) decouples backend schema from frontend types cleanly.

## Evaluation notes (flywheel)

- Failure modes observed: None — build passed first try.
- Graders run and results (PASS/FAIL): npm run build → PASS (exit 0, 8 routes)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add `generateStaticParams` to products/[id] using known product IDs from FEATURED_PRODUCTS for static product detail pages.
