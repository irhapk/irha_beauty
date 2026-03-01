---
id: "0022"
title: Phase 05 Homepage
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement phase 05.
labels: ["homepage","carousel","framer-motion","nextjs","static-data","products"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/lib/slides.ts
  - frontend/lib/static-data.ts
  - frontend/components/home/HeroCarousel.tsx
  - frontend/components/home/CategoryGrid.tsx
  - frontend/components/home/FeaturedProducts.tsx
  - frontend/components/home/index.ts
  - frontend/components/product/ProductCard.tsx
  - frontend/components/product/index.ts
  - frontend/app/page.tsx
  - specs/004-nextjs-storefront/tasks.md
tests:
  - npm run build → exit 0 (TypeScript clean, static prerender of /)
---

## Prompt

i already put all images in public you can see and start phase 5 implement

## Response snapshot

Implemented Phase 5 — Homepage (T035–T039). All components built and build passes.

**Image mapping**: Public images use underscored names (`shampoo_banner.png` not `banner-shampoo.jpg`). No `logo.png` yet. All 8 images mapped in static-data.ts and slides.ts.

**Backend field mismatch**: Backend `ProductRead`/`CategoryRead` don't return `slug`, `image`, `hoverImage`, `status`, `bannerImage`, `categoryImage`. Homepage uses static data. Phase 6+ will integrate live API once backend schema is extended.

**T035 — `frontend/lib/slides.ts`**: 3 slides (shampoo, oils, fragrance) with actual image filenames, subtitle, headline, body, ctaHref.

**T036 — `frontend/components/home/HeroCarousel.tsx`** ("use client"): Full carousel with:
- Directional variants: `enter(dir)` / `center` / `exit(dir)` using bezier ease `[0.25,0.46,0.45,0.94]`
- `AnimatePresence mode="wait" custom={dir}` — exit completes before enter
- Per-slide staggered text: subtitle (delay 0.2s), headline (0.5s), body (1.2s), CTA (1.7s)
- CTA pulsing gold ring: `animate={{ boxShadow: PULSE_SHADOW }}` with `repeat: Infinity`
- Auto-advance 4s via `useRef` (isPaused) + `useCallback` (paginate) + `useEffect`
- Arrow buttons (FiChevronLeft/Right) + dot navigation (active dot: `w-8 bg-gold`, inactive: `w-2 bg-white/40`)
- `next/image fill + priority` + black/50 overlay

**T037 — `frontend/components/home/CategoryGrid.tsx`** ("use client"): 3-column grid, `ScrollReveal` + `scrollItemVariants`, `motion.div whileHover={{ scale: 1.02 }}`, `next/image fill`, `group-hover:scale-105` CSS zoom, "Coming Soon" badge with gold border, overlay darkens on hover.

**T038 — `frontend/components/home/FeaturedProducts.tsx`** ("use client"): Cream background section, `FadeIn` heading, gold underline `motion.div scaleX` animation, `ScrollReveal` product grid, "View All Products" link.

**ProductCard (basic) — `frontend/components/product/ProductCard.tsx`** ("use client"): `motion.div whileHover={{ y: -8 }}`, dual-image CSS opacity swap on `group-hover`, "Add to Cart" overlay slides up on hover, `addItem(product)` calls Zustand cart store, out-of-stock overlay.

**Bug fixed**: `addItem` signature is `(product: Product, qty?: number)` — was passing a `CartItem`-shaped object literal which TypeScript rejected. Fixed to pass `product` directly.

**T039 — `frontend/app/page.tsx`** (Server Component): Imports static data, renders HeroCarousel + CategoryGrid + FeaturedProducts. No async fetching for now — backend schema doesn't include image/slug/status fields yet.

**Build result**: `npm run build` → exit 0. TypeScript clean. `/` prerendered as static content.

## Outcome

- ✅ Impact: Homepage is fully built — hero carousel with staggered text, category grid with hover effects, featured product card with dual-image swap and cart integration.
- 🧪 Tests: npm run build exits 0, TypeScript strict-clean.
- 📁 Files: 9 new files created (slides.ts, static-data.ts, 3 home components, 2 barrel exports, ProductCard, page.tsx) + tasks.md updated (T035–T039 marked [X]).
- 🔁 Next prompts: /sp.implement phase 06 (Category pages, Product pages, ComingSoon component)
- 🧠 Reflection: Backend schema mismatch (no slug/image/status on products/categories) required static data strategy for Phase 5. When backend is extended, swap static data for live API calls. addItem takes Product not CartItem — always check store signatures before calling.

## Evaluation notes (flywheel)

- Failure modes observed: ProductCard called `addItem({ productId, name, image, price, quantity })` — but `addItem(product: Product)` — TypeScript caught the type mismatch at build time.
- Graders run and results (PASS/FAIL): npm run build → PASS (exit 0)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add image dimensions to next/image components with explicit width/height where fill is not used, to improve LCP scores.
