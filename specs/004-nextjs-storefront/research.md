# Research: 004-nextjs-storefront

**Date**: 2026-02-28
**Branch**: 004-nextjs-storefront

---

## Decision 1 — Framer Motion with Next.js 15 App Router

**Decision**: All animated components require `"use client"` directive. Create a thin `PageTransition.tsx` client wrapper in `components/animations/` that wraps `{children}` with `<AnimatePresence mode="wait">` and a `<motion.div key={pathname}>` using `usePathname()` from `next/navigation`. This wrapper is placed in `app/layout.tsx` which stays a Server Component.

**Rationale**: Framer Motion runs entirely client-side — motion components cannot be rendered in RSC. Isolating animations to leaf client components keeps the RSC tree efficient. The `key={pathname}` on the motion div is what triggers AnimatePresence to detect route changes.

**Alternatives considered**:
- Making layout.tsx a client component — rejected (loses all RSC benefits, unnecessary)
- react-spring — rejected (Framer Motion is specified in constitution and has better DX for this use case)

---

## Decision 2 — Hero Carousel (AnimatePresence + direction-aware)

**Decision**: Use `useState` for `[currentIndex, direction]` and `AnimatePresence mode="wait" custom={direction}`. Define directional variants: `enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 })`, `center: { x: 0, opacity: 1 }`, `exit: (dir) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0 })`. Auto-advance via `useEffect` + `setInterval(4000)` with `clearInterval` cleanup on unmount. Pause on hover via `onMouseEnter`/`onMouseLeave` toggling a `isPaused` ref.

**Rationale**: `AnimatePresence` with `custom` prop and directional variants is the canonical Framer Motion pattern for directional carousels. `mode="wait"` ensures the exiting slide finishes before the entering slide starts. Timer cleanup prevents memory leaks.

**Alternatives considered**:
- Swiper.js — rejected (external dep, constitution specifies Framer Motion for all animations)
- CSS-only transitions — rejected (cannot achieve the staggered text animation per-slide)

---

## Decision 3 — Dual-image product card hover

**Decision**: Use CSS approach: two `next/image` components stacked with `absolute inset-0`, primary at `opacity-100 group-hover:opacity-0`, secondary at `opacity-0 group-hover:opacity-100`, both with `transition-opacity duration-500 ease-in-out`. Parent card gets `group` class.

**Rationale**: CSS `opacity` transitions are GPU-composited — zero JS execution on hover, no re-renders, 60fps guaranteed. Simpler than Framer Motion `whileHover` for this specific case. The `group` Tailwind utility is perfect for parent-driven child transitions. Card lift and shadow on hover still uses `motion.div whileHover={{ y: -8 }}`.

**Alternatives considered**:
- Framer Motion `whileHover` with `variants` on two images — rejected (triggers React re-render on every hover, heavier for a grid of many cards)
- CSS background-image swap — rejected (cannot use `next/image` optimisation)

---

## Decision 4 — Zustand v5 + localStorage persistence (SSR-safe)

**Decision**: Use Zustand v5 `create` with `persist` middleware and `skipHydration: true`. Create a `StoreProvider.tsx` client component (mounted in `layout.tsx`) that calls `useCartStore.persist.rehydrate()` in a `useEffect`. This ensures localStorage is only accessed client-side, preventing Next.js SSR hydration mismatch.

**Zustand v5 syntax**:
```ts
const useCartStore = create<CartState>()(
  persist((set) => ({ ... }), {
    name: 'irha-cart',
    skipHydration: true,
  })
)
```

**Rationale**: `skipHydration: true` prevents Zustand from reading localStorage during SSR. The `StoreProvider` component triggers rehydration only after the component mounts in the browser. This is the official Zustand v5 recommendation for Next.js App Router.

**Alternatives considered**:
- `zustand/middleware` with no SSR handling — rejected (causes hydration mismatch warnings)
- React Context for cart — rejected (constitution specifies Zustand; Context requires prop threading)

---

## Decision 5 — Scroll reveal: whileInView with stagger

**Decision**: Use `motion.div whileInView` + `viewport={{ once: true, margin: "-100px" }}` on container elements. For staggered grids, use `variants` with `staggerChildren: 0.1` on the parent `motion.div` and `variants` with `hidden/visible` states on each child. This is wrapped in a reusable `<ScrollReveal>` component.

```ts
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}
```

**Rationale**: `whileInView` is simpler than `useInView` + `useAnimation` and sufficient for all scroll reveal needs in this project. `viewport.once: true` ensures animations fire once. `margin: "-100px"` triggers the animation slightly before the element is fully in view for a more natural feel.

**Alternatives considered**:
- `useInView` + `useAnimation` — rejected (more code, same outcome for this use case)
- Intersection Observer directly — rejected (Framer Motion is already imported, no need for manual implementation)

---

## Decision 6 — Auth hydration from httpOnly cookies

**Decision**: Create `components/providers/AuthProvider.tsx` (`"use client"`) that calls `GET /api/auth/me` (via Next.js rewrite proxy) on mount with Axios `withCredentials: true`. On 200 → `setUser(data)` in Zustand auth store. On 401/error → `clearUser()`. Mount this in `app/layout.tsx` wrapping children. No SSR auth check for Phase 4.

**Rationale**: httpOnly cookies are inaccessible via `document.cookie` — the only way to check auth is to call the backend. A client-side check on mount is the simplest correct pattern for a SPA-like experience in Next.js App Router. Placing it in layout.tsx ensures it runs on every page.

**Alternatives considered**:
- Next.js middleware for SSR auth redirect — rejected (requires cookie parsing server-side, more complex, overkill for Phase 4)
- next-auth — rejected (constitution specifies custom JWT auth, and backend already implements it)

---

## Decision 7 — API proxy via Next.js rewrites (eliminates CORS)

**Decision**: Configure `next.config.ts` with rewrites to proxy `/api/:path*` → `http://localhost:8000/:path*`. Axios `baseURL` becomes `/api` (same-origin). `withCredentials: true` on the Axios instance for cookie forwarding. In production, the rewrite destination becomes the deployed FastAPI URL via `NEXT_PUBLIC_API_URL` env var.

```ts
// next.config.ts
async rewrites() {
  return [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` }]
}
```

**Rationale**: Same-origin proxying eliminates all CORS preflight complexity. Cookies are sent automatically since requests appear to come from `localhost:3000`. This also means the actual backend URL is never exposed to the browser. Clean and secure.

**Alternatives considered**:
- Direct cross-origin Axios to localhost:8000 with `withCredentials: true` — rejected (requires CORS `allow_origins` to include `localhost:3000`, which is already set in FastAPI, but SameSite=Lax cookies may not send cross-origin in some browsers)
- Next.js API route proxy — rejected (more boilerplate than rewrites, same outcome)

---

## Decision 8 — COD order payload + backend requirement

**Decision**: The frontend needs a backend orders endpoint to persist orders and enable order history. A minimal `POST /api/v1/orders` endpoint must be added to the FastAPI backend as part of this feature. Order payload:

```json
{
  "customer_name": "string",
  "address": "string",
  "city": "string",
  "phone": "string",
  "items": [{ "product_id": 1, "quantity": 2, "unit_price": 1800 }],
  "payment_method": "cod",
  "total_amount": 3600
}
```

Response: `201` with `{ id, status: "pending", created_at, ...order }`.

`GET /api/v1/orders/my` returns the authenticated user's orders. Guest orders (no auth) are stored locally only in localStorage.

**Rationale**: Without a backend orders endpoint, the "View Order History" user story (US4) is impossible for logged-in users. The minimal endpoint (create + list-mine) is low effort and essential.

**Alternatives considered**:
- Store all orders in localStorage only — rejected (breaks US4 for logged-in users; orders lost on browser clear)
- Full orders domain with status management — deferred to Phase 5 (too broad for this feature)

---

## Summary of Key Decisions

| # | Topic | Decision |
|---|-------|----------|
| 1 | Framer Motion + Next.js 15 | `PageTransition` client wrapper in layout with `key={pathname}` |
| 2 | Hero carousel | `AnimatePresence mode="wait"` + directional variants + `setInterval` auto-advance |
| 3 | Dual-image hover | CSS `opacity` transition with Tailwind `group` + `group-hover` |
| 4 | Zustand persistence | `skipHydration: true` + `StoreProvider` rehydrate on mount |
| 5 | Scroll reveal | `whileInView` + `viewport={{ once: true }}` + `staggerChildren` variants |
| 6 | Auth hydration | `AuthProvider` client component calls `/api/auth/me` on mount |
| 7 | API integration | Next.js rewrites proxy `/api/*` → FastAPI (eliminates CORS) |
| 8 | COD orders | Minimal backend orders domain (create + list-mine) required |
