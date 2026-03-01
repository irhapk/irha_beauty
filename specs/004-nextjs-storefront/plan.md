# Implementation Plan: Irha Beauty Frontend Storefront

**Branch**: `004-nextjs-storefront` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-nextjs-storefront/spec.md`

---

## Summary

Build the complete Irha Beauty customer-facing storefront — a luxury animated ecommerce experience matching the premiumwallartstudio.com reference design. Stack: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Zustand + Axios. The frontend connects to the existing FastAPI backend via a Next.js rewrite proxy. A minimal orders domain must also be added to the backend (create order + list-mine) to support checkout and order history.

Key technical decisions: directional AnimatePresence carousel, CSS group-hover dual-image swap, Zustand v5 skipHydration pattern, AuthProvider on mount, Next.js rewrites to eliminate CORS.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict)
**Primary Dependencies**: Next.js 15, Framer Motion v11, Zustand v5, Axios, Tailwind CSS v3, shadcn/ui, React Icons
**Storage**: localStorage (cart via Zustand persist) + FastAPI/NeonDB (orders, auth, products)
**Testing**: Manual / browser (no automated frontend tests in Phase 4)
**Target Platform**: Web — desktop + mobile (320px → 1470px)
**Performance Goals**: Above-fold content visible within 2s; animations at 60fps; no layout shift on image load
**Constraints**: Images must be in `frontend/public/`; cookies httpOnly (no JS access); no Stripe in Phase 4
**Scale/Scope**: 1 product, 3 categories, ~12 routes, single developer

---

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Next.js 15 App Router | ✅ | RSC by default, "use client" only where needed |
| TypeScript strict | ✅ | No `any` without justification |
| Framer Motion mandatory on all elements | ✅ | ScrollReveal + FadeIn wrappers enforce this |
| Tailwind only — no inline styles | ✅ | Enforced by component rules |
| next/image for all images | ✅ | No raw `<img>` tags |
| Zustand for cart + auth | ✅ | Two stores: cart.store.ts, auth.store.ts |
| Axios with withCredentials | ✅ | Single instance in lib/api.ts |
| Cormorant Garamond + Instrument Sans | ✅ | Via next/font/google |
| Black/Gold/Cream palette | ✅ | Tailwind config extends theme |
| No admin panel | ✅ | Out of scope |
| No Stripe | ✅ | COD only |

**Gate result**: ✅ PASS — no violations

---

## Project Structure

### Documentation (this feature)

```
specs/004-nextjs-storefront/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── frontend.md      ← Phase 1 output
└── tasks.md             ← /sp.tasks output (not yet created)
```

### Source Code

```
frontend/                          ← Next.js 15 app (to be initialised)
├── app/
│   ├── layout.tsx                 # Root layout: fonts, Providers wrapper
│   ├── page.tsx                   # Homepage (RSC — fetches products/categories)
│   ├── (auth)/
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Register page
│   ├── categories/
│   │   └── [slug]/page.tsx        # Dynamic: shampoo=live, oils/fragrance=coming-soon
│   ├── products/
│   │   ├── page.tsx               # All products listing
│   │   └── [id]/page.tsx          # Product detail page
│   ├── cart/page.tsx              # Cart page
│   ├── checkout/page.tsx          # Checkout (COD form)
│   ├── orders/page.tsx            # Order history (auth-protected)
│   ├── about/page.tsx             # About Us
│   └── contact/page.tsx           # Contact form
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Fixed header: logo + nav + cart icon + auth
│   │   ├── Footer.tsx             # Dark footer: links + newsletter + socials
│   │   └── ScrollProgress.tsx     # Top scroll progress bar
│   ├── providers/
│   │   ├── Providers.tsx          # "use client" — wraps children with all providers
│   │   ├── AuthProvider.tsx       # Hydrates auth store from /api/v1/auth/me on mount
│   │   └── StoreProvider.tsx      # Rehydrates Zustand cart from localStorage on mount
│   ├── animations/
│   │   ├── PageTransition.tsx     # AnimatePresence wrapper keyed on pathname
│   │   ├── ScrollReveal.tsx       # whileInView wrapper (reusable)
│   │   └── FadeIn.tsx             # Sequenced opacity/y entrance
│   ├── home/
│   │   ├── HeroCarousel.tsx       # 3-slide auto-carousel with per-slide text stagger
│   │   ├── CategoryGrid.tsx       # 3 category cards with scroll reveal
│   │   └── FeaturedProducts.tsx   # Featured product(s) section
│   ├── product/
│   │   ├── ProductCard.tsx        # Dual-image hover, lift, slide-up actions
│   │   └── ProductDetail.tsx      # Full product detail with add-to-cart
│   ├── cart/
│   │   ├── CartPage.tsx           # Full cart view
│   │   └── CartIcon.tsx           # Header cart icon with badge
│   ├── checkout/
│   │   └── CheckoutForm.tsx       # COD form with validation
│   ├── orders/
│   │   └── OrderList.tsx          # Order history list
│   └── ui/                        # shadcn/ui auto-generated components
├── lib/
│   ├── api.ts                     # Axios instance + all typed API functions
│   └── utils.ts                   # cn() helper + formatPrice()
├── store/
│   ├── cart.store.ts              # Zustand cart (persist to localStorage)
│   └── auth.store.ts              # Zustand auth (no persist — hydrated from API)
├── types/
│   └── index.ts                   # Product, Category, CartItem, Order, User, Slide
├── public/                        # Static assets (images added by user after init)
├── .env.local                     # NEXT_PUBLIC_API_URL=http://localhost:8000
├── .env.example                   # Committed placeholder
├── next.config.ts                 # rewrites: /api/* → FastAPI
├── tailwind.config.ts             # Extended: gold, cream, dark-brown colours + fonts
└── tsconfig.json                  # strict: true

backend/app/orders/                ← NEW backend domain (minimal)
├── __init__.py
├── models.py                      # Order + OrderItem SQLAlchemy models
├── schemas.py                     # CreateOrderRequest, OrderRead, OrderItemRead
├── repository.py                  # create_order, get_orders_by_user
├── service.py                     # create, list_my_orders
├── router.py                      # POST /orders, GET /orders/my
└── tests/
    └── test_orders.py             # Basic order creation + list tests
```

---

## Implementation Design

### 1. Backend orders domain (prerequisite)

Before frontend work, the backend needs `app/orders/` with two endpoints:

**POST /api/v1/orders**
- Auth optional (user_id from cookie if present, else null)
- Validates product IDs exist
- Creates `orders` + `order_items` rows
- Returns `201 OrderRead`

**GET /api/v1/orders/my**
- Auth required (`get_current_user` dependency)
- Returns all orders for the current user ordered by created_at DESC

**Alembic migration**: `add_orders_and_order_items` — creates two new tables.

---

### 2. Next.js app initialisation

```bash
npx create-next-app@latest frontend/ \
  --typescript --tailwind --eslint --app \
  --src-dir no --import-alias "@/*"
```

Then extend `tailwind.config.ts`:
```ts
theme: {
  extend: {
    colors: {
      gold: '#ca9236',
      cream: '#F5F3EB',
      'dark-brown': '#4E423D',
      'gray-mid': '#555555',
      'gray-light': '#999999',
    },
    fontFamily: {
      heading: ['var(--font-cormorant)', 'serif'],
      body: ['var(--font-instrument-sans)', 'sans-serif'],
    }
  }
}
```

---

### 3. Global providers pattern

`app/layout.tsx` (Server Component):
```tsx
import { Providers } from '@/components/providers/Providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <Header />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <ScrollProgress />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
```

`Providers.tsx` ("use client"):
- Mounts `<AuthProvider>` + `<StoreProvider>`
- Both use `useEffect` to hydrate state after mount

---

### 4. Hero Carousel design

```tsx
// State
const [index, setIndex] = useState(0)
const [direction, setDirection] = useState(1)

// Variants (direction-aware)
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
}

// Per-slide text stagger delays
// subtitle: 0.2s, headline: 0.5s, body: 1.2s, CTA: 1.7s

// Auto-advance: useEffect → setInterval(4000) → clearInterval on unmount
```

---

### 5. ProductCard dual-image design

```tsx
<div className="group relative overflow-hidden aspect-[3/4]">
  {/* Primary image */}
  <Image src={product.image} fill className="object-cover transition-opacity duration-500 group-hover:opacity-0" />
  {/* Hover image */}
  <Image src={product.hoverImage} fill className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  {/* Actions — slide up on hover */}
  <div className="absolute bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
    <AddToCartButton />
  </div>
</div>
```

---

### 6. ScrollReveal wrapper

```tsx
"use client"
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

// Usage: wrap any grid or section
<ScrollReveal>
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</ScrollReveal>
```

---

### 7. Auth flow

1. App loads → `AuthProvider` mounts → calls `GET /api/auth/me`
2. Success → `setUser(data)` in Zustand auth store
3. 401 → `clearUser()` (stay logged out)
4. Protected routes (`/checkout`, `/orders`) check `isAuthenticated` from store → redirect to `/login` if false
5. Token refresh handled by Axios 401 interceptor → `POST /api/auth/refresh` → retry

---

### 8. Axios instance + Next.js rewrites

`next.config.ts`:
```ts
async rewrites() {
  return [{ source: '/api/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` }]
}
```

`lib/api.ts`:
```ts
const api = axios.create({ baseURL: '/api', withCredentials: true })
// 401 interceptor: refresh token → retry once
```

---

## Implementation Phases (for /sp.tasks)

| Phase | Name | Key deliverables |
|-------|------|-----------------|
| 1 | Backend orders domain | models, migration, service, router, 4 tests |
| 2 | Frontend init + config | Next.js app, Tailwind theme, fonts, env, rewrites |
| 3 | Shared foundation | types, api.ts, stores, providers, ScrollReveal, FadeIn, PageTransition |
| 4 | Layout shell | Header, Footer, ScrollProgress, ScrollToTop |
| 5 | Homepage | HeroCarousel, CategoryGrid, FeaturedProducts |
| 6 | Category + Product pages | [slug]/page, ProductCard (dual-image), ProductDetail |
| 7 | Cart | CartIcon, CartPage, Zustand cart actions |
| 8 | Checkout + Orders | CheckoutForm (COD), order submission, OrderList |
| 9 | Auth pages | Login, Register, route guards |
| 10 | About + Contact | Static pages with animations |
| 11 | Polish | Responsive audit, animation pass, ScrollToTop, coming-soon page |

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Images missing at dev time | High | Use Next.js `placeholder="blur"` + `blurDataURL` fallbacks; add placeholder gradient during development |
| Framer Motion SSR warnings | Medium | Ensure all motion components are inside `"use client"` boundary; use `LazyMotion` for bundle size |
| Zustand hydration mismatch | Medium | `skipHydration: true` + StoreProvider rehydrate pattern resolves this |
| CORS cookies not sent | Low | Next.js rewrites proxy eliminates CORS entirely |
| Backend orders endpoint missing | High | Implement as Phase 1 before any frontend checkout work |
