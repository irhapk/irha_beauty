---
id: "0025"
title: Phase 08 Checkout and Order History
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement phase 08.
labels: ["checkout","orders","skeleton","suspense","zustand","framer-motion","nextjs"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/ui/skeleton.tsx
  - frontend/components/checkout/CheckoutForm.tsx
  - frontend/components/checkout/index.ts
  - frontend/app/checkout/page.tsx
  - frontend/app/orders/page.tsx
  - specs/004-nextjs-storefront/tasks.md
tests:
  - npm run build → exit 0 (11 routes, /checkout static, /orders static)
---

## Prompt

/sp.implement phase 08.

## Response snapshot

Implemented Phase 8 — Checkout & Order History (T048–T050). Five files created, build passes cleanly with 11 routes.

**`components/ui/skeleton.tsx`** (manual shadcn-style): `animate-pulse rounded-sm bg-gray-100` — no extra deps, matches shadcn pattern. Used by orders page loading state.

**T048 — `components/checkout/CheckoutForm.tsx`** ("use client"):

- Form fields (shadcn `<Input>` + `<Label>`): Full Name, Address, City, Phone iterated from `FIELD_KEYS` array constant — no magic strings repeated.
- `validate()`: all required, phone min 10 digits (strips non-digits before counting). Sets `FieldErrors` (Partial Record) and returns boolean.
- Payment section: black circle with `FiCheck` icon + "Cash on Delivery" label.
- `handleSubmit`: builds `CreateOrderPayload` from form fields + cart items (productId→product_id, price→unit_price), calls `createOrder(payload)`. On success: `clearCart()` + `router.push("/orders?confirmed=true")`. On error: sets `apiError` inline.
- Button label shows `Place Order · PKR X,XXX` when idle, `FiLoader animate-spin + Placing Order…` when submitting, `disabled` during submission.

**T049 — `app/checkout/page.tsx`** ("use client"):

- Guard: `useEffect` → if `items.length === 0` → `router.replace("/cart")`. Returns `<></>` during redirect.
- 2-column grid (lg:grid-cols-3): form in `lg:col-span-2`, summary in `lg:col-span-1`.
- Order summary: thumbnail `next/image` (h-16 w-12), item name, qty, line total in gold.
- All sections animated with `FadeIn` (delay=0.2 for summary card).

**T050 — `app/orders/page.tsx`** ("use client"):

- Split into `OrdersContent` (uses `useSearchParams`) + `OrdersPage` (default export wraps with `<Suspense>`) — required in Next.js 15+ to avoid build error.
- Auth guard: `useEffect` watches `isAuthenticated + authLoading`; redirects to `/login` when auth resolves as unauthenticated. Returns `<></>` while pending.
- `fetchMyOrders()` called in `useEffect` when `isAuthenticated` is true. Error state shown inline.
- Loading: `OrdersSkeleton` — 3 placeholder cards with Skeleton divs.
- Empty state: `FiPackage` icon + FadeIn "No orders yet" message.
- Order cards: `ScrollReveal` container + `motion.div variants={scrollItemVariants}` — stagger on scroll.
- Card content: Order #ID, `formatDate(created_at)`, status badge with `STATUS_STYLES` (yellow/blue/green/red), items count + qty summary, city + phone footer, total in gold.
- `?confirmed=true` banner: `motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}` with `FiCheckCircle` icon.
- Suspense fallback: full `<main>` with heading skeleton + `OrdersSkeleton`.

**Build result**: `npm run build` → exit 0. 11 routes. `/checkout` and `/orders` prerendered as static content (client-side Zustand + auth hydration).

## Outcome

- ✅ Impact: COD checkout form + order submission fully wired. Order history page with auth guard, skeleton loading, animated success banner, status badges, scroll-reveal cards. End-to-end flow: cart → checkout → place order → clearCart → /orders?confirmed=true.
- 🧪 Tests: npm run build exits 0, TypeScript clean, 11 routes.
- 📁 Files: 5 new files (skeleton.tsx, CheckoutForm.tsx, checkout/index.ts, checkout/page.tsx, orders/page.tsx) + tasks.md (T048, T049, T050 marked [X]).
- 🔁 Next prompts: /sp.implement phase 09 (Auth pages: register, login), then phase 10 (About + Contact)
- 🧠 Reflection: `useSearchParams()` must be in a component wrapped by `<Suspense>` — splitting into `OrdersContent` + `OrdersPage` is the correct Next.js 15+ pattern. `Skeleton` is not bundled in shadcn by default for Tailwind v4 projects; creating it manually as `animate-pulse rounded-sm bg-gray-100` is the cleanest approach. Auth guard via `useAuthStore` + `useEffect` is non-blocking: renders `<></>` while auth resolves, then redirects or renders orders.

## Evaluation notes (flywheel)

- Failure modes observed: None — build passed first try.
- Graders run and results (PASS/FAIL): npm run build → PASS (exit 0, 11 routes)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add order item product names to the order cards (requires enriching OrderItemRead with product name from backend, or storing name at order-creation time).
