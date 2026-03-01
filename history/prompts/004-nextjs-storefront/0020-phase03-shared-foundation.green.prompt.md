---
id: "0020"
title: Phase 03 Shared Foundation
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement
labels: ["types","zustand","axios","framer-motion","providers","animations","frontend"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/types/index.ts
  - frontend/lib/utils.ts
  - frontend/lib/api.ts
  - frontend/store/cart.store.ts
  - frontend/store/auth.store.ts
  - frontend/store/index.ts
  - frontend/components/providers/AuthProvider.tsx
  - frontend/components/providers/StoreProvider.tsx
  - frontend/components/providers/Providers.tsx
  - frontend/components/animations/ScrollReveal.tsx
  - frontend/components/animations/FadeIn.tsx
  - frontend/components/animations/PageTransition.tsx
  - frontend/components/animations/index.ts
tests:
  - "npm run build — exit 0, TypeScript clean"
---

## Prompt

/sp.implement phase 03.

## Response snapshot

Implemented Phase 3 (Shared Foundation) — T017 through T028, all 12 tasks.

**types/index.ts**: 9 interfaces — Product (with slug/image/hoverImage/inStock for frontend use), Category, CartItem, User, OrderItemIn, CreateOrderPayload, Order, Slide, ApiError.

**lib/utils.ts**: Extended shadcn cn() with formatPrice (PKR locale via toLocaleString) + formatDate (en-GB short).

**lib/api.ts**: Axios instance at baseURL '/api' with withCredentials. 401 interceptor uses module augmentation (declare module 'axios' { interface InternalAxiosRequestConfig { _retry?: boolean } }) for type-safe retry flag. Refresh-and-retry pattern: POST /v1/auth/refresh then replay original request. 10 fully typed API functions across auth/products/categories/orders domains.

**store/cart.store.ts**: Zustand v5 + persist middleware (skipHydration: true, name: 'irha-cart'). addItem handles duplicates by incrementing qty. Derived selectors useCartTotal and useCartCount exported separately (not stored in state — avoids stale closures).

**store/auth.store.ts**: Zustand v5, no persistence. isLoading starts true (prevents flash of unauthenticated state before AuthProvider runs).

**Providers**: StoreProvider (rehydrates cart on mount) → AuthProvider (fetches /me on mount, sets/clears user) → children. Single <Providers> component for layout.tsx.

**Animations**: ScrollReveal (whileInView stagger, exports scrollItemVariants for child elements), FadeIn (initial/animate, direction-aware), PageTransition (AnimatePresence wait mode, pathname key).

Build result: exit 0, TypeScript clean.

## Outcome

- ✅ Impact: Complete shared foundation — all types, API client, state stores, providers, and animation primitives ready for Phase 4 (layout shell) and beyond
- 🧪 Tests: npm run build — exit 0, TypeScript clean
- 📁 Files: 13 files created/modified
- 🔁 Next prompts: /sp.implement phase 04 (Header, Footer, ScrollProgress, ScrollToTop, layout wiring)
- 🧠 Reflection: Zustand v5 skipHydration + StoreProvider pattern prevents SSR hydration mismatch. Auth store isLoading=true by default prevents flash of unauthenticated UI. Module augmentation is the clean TypeScript way to add _retry to Axios config.

## Evaluation notes (flywheel)

- Failure modes observed: None — all 12 tasks completed cleanly
- Graders run and results (PASS/FAIL): npm run build PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
