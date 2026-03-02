# Irha Beauty — Full-Stack Constitution

**Version**: v4.1.0
**Ratified**: 2026-02-28
**Amended**: 2026-03-02 — Deployment updated: Vercel (frontend) + Railway (backend) + irhapk.com domain; GitHub repo migrated to irhapk/irha_beauty

---

## 1. Project Identity

- **Project**: Irha Beauty — Full-Stack Ecommerce (Beauty Products)
- **Backend Phase 1** ✅ Complete — CRUD APIs with in-memory storage
- **Backend Phase 2** ✅ Complete — NeonDB (PostgreSQL) via SQLAlchemy async + Alembic migrations
- **Backend Phase 3** ✅ Complete — JWT auth in httpOnly cookies, bcrypt, register/login/logout/refresh/me
- **Frontend Phase 4** 🔄 In Progress — Next.js 15 storefront (black/white/gold luxury theme)
- **Goal**: Layered, domain-driven architecture on the backend. Animated, luxury ecommerce experience on the frontend.

---

## 2. Tech Stack

| Layer | Choice | Phase |
|---|---|---|
| Language | Python 3.12+ | 1 + 2 + 3 |
| Framework | FastAPI | 1 + 2 + 3 |
| Type validation | Pydantic v2 | 1 + 2 + 3 |
| Server | Uvicorn | 1 + 2 + 3 |
| Tests | pytest + httpx (async test client) | 1 + 2 + 3 |
| ORM | SQLAlchemy 2.x (async) | 2 + 3 |
| DB driver | asyncpg (TCP) | 2 + 3 |
| Database | NeonDB — serverless PostgreSQL | 2 + 3 |
| Migrations | Alembic | 2 + 3 |
| Config/Secrets | pydantic-settings + `.env` | 2 + 3 |
| Password hashing | passlib[bcrypt] | 3 |
| JWT | PyJWT[cryptography] | 3 |
| Token transport | httpOnly cookies (Secure, SameSite=Lax) | 3 |

---

## 3. Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, router registration
│   ├── core/
│   │   ├── exceptions.py        # Custom exception handlers
│   │   ├── database.py          # Async engine, sessionmaker, Base
│   │   ├── deps.py              # get_db session + get_current_user  ← updated Phase 3
│   │   ├── config.py            # pydantic-settings Settings
│   │   └── security.py          # JWT encode/decode, bcrypt           ← NEW in Phase 3
│   ├── auth/                    # Auth domain                         ← NEW in Phase 3
│   │   ├── router.py            # /register /login /logout /refresh /me
│   │   ├── schemas.py           # RegisterRequest, LoginRequest, TokenRead, UserRead
│   │   ├── service.py           # register, login, logout, refresh logic
│   │   └── tests/
│   │       └── test_auth.py
│   └── <domain>/
│       ├── router.py            # Route definitions
│       ├── schemas.py           # Pydantic request/response models
│       ├── models.py            # SQLAlchemy ORM model
│       ├── repository.py        # All DB queries (no business logic)
│       ├── service.py           # Business logic (calls repository)
│       └── tests/
│           └── test_<domain>.py
├── alembic/                     # Migration scripts
│   ├── env.py
│   └── versions/
├── alembic.ini
├── conftest.py                  # Global pytest fixtures
├── .env                         # Secrets — never committed
├── .env.example                 # Committed template with no values
└── requirements.txt
```

---

## 4. API Design Rules

*(Unchanged from Phase 1)*

- All routes prefixed with `/api/v1/`
- Standard CRUD pattern per resource:

| Action | Method | Path |
|---|---|---|
| List all | GET | `/api/v1/<resource>` |
| Get one | GET | `/api/v1/<resource>/{id}` |
| Create | POST | `/api/v1/<resource>` |
| Update | PUT | `/api/v1/<resource>/{id}` |
| Delete | DELETE | `/api/v1/<resource>/{id}` |

- All request bodies validated with Pydantic models — no raw dicts
- All responses return Pydantic models — no untyped dicts
- Uniform error response: `{ "detail": "...", "code": "SCREAMING_SNAKE" }`
- HTTP status codes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`

**Auth-specific routes** (Phase 3 — outside standard CRUD pattern):

| Action | Method | Path |
|---|---|---|
| Register | POST | `/api/v1/auth/register` |
| Login | POST | `/api/v1/auth/login` |
| Logout | POST | `/api/v1/auth/logout` |
| Refresh token | POST | `/api/v1/auth/refresh` |
| Current user | GET | `/api/v1/auth/me` |

---

## 5. Schema Conventions

*(Unchanged from Phase 1)*

- One schemas file per domain: `app/<domain>/schemas.py`
- Three schema classes per resource: `<Resource>Create`, `<Resource>Update`, `<Resource>Read`
- Use `model_config = ConfigDict(from_attributes=True)` on all schemas

---

## 6. Layering Rules

Updated for Phase 2 — four layers:

| Layer | File | Responsibility |
|---|---|---|
| Router | `router.py` | Parse request, inject DB session, call service, return response |
| Service | `service.py` | Business logic and constraint checks — calls repository only |
| Repository | `repository.py` | All DB queries — no business logic, no HTTP concerns |
| Model | `models.py` | SQLAlchemy ORM table definition only |

- **No raw SQL in services** — only repository calls
- **No DB session in routers** — inject via `Depends(get_db)` and pass to service
- **No business logic in repositories** — repositories only query and return

---

## 7. Database Principles

- **Engine**: single async engine created once at startup via `app/core/database.py`
- **Session**: `AsyncSession` via `async_sessionmaker` — one session per request, injected by `get_db` dependency
- **Base**: `DeclarativeBase` subclass in `app/core/database.py` — all models inherit from it
- **Migrations**: every schema change requires an Alembic migration — `Base.metadata.create_all()` is forbidden
- **`CASCADE` deletes**: must be intentional and documented in the model docstring
- **No raw SQL strings** except in complex Alembic migrations (document the reason)
- **Connection**: asyncpg TCP to NeonDB — connection string from `.env` as `DATABASE_URL`

---

## 8. Configuration and Secrets

- All sensitive values via `.env` + `pydantic-settings` `Settings` class in `app/core/config.py`
- `.env` is gitignored — never committed
- `.env.example` is committed with placeholder values and no real secrets
- Minimum required variables:
  - `DATABASE_URL` — full asyncpg connection string to NeonDB
- Settings loaded once at startup, injected where needed
- **Phase 3 adds** to required `.env` variables:
  - `JWT_SECRET` — random 32-byte hex string, used to sign access tokens
  - `JWT_ALGORITHM` — `HS256`
  - `ACCESS_TOKEN_EXPIRE_MINUTES` — e.g. `30`
  - `REFRESH_TOKEN_EXPIRE_DAYS` — e.g. `7`

---

## 8a. Security & Auth Rules (Phase 3)

- **Passwords**: hashed with bcrypt via `passlib[bcrypt]` — never stored plain, never logged
- **JWT**: signed with `HS256` using `JWT_SECRET` from `.env`
- **Access token**: short-lived (30 min), stored in httpOnly cookie named `access_token`
- **Refresh token**: long-lived (7 days), stored in httpOnly cookie named `refresh_token`
- **Cookie flags**: `httpOnly=True`, `secure=True` (HTTPS only in production), `samesite="lax"`
- **Token payload**: `{ "sub": user_id, "exp": expiry }`
- **`get_current_user` dependency**: reads `access_token` cookie, decodes JWT, returns User ORM object — raises `401` if missing or invalid
- **Auth domain has no `models.py` or `repository.py`**: it reuses `app/users/models.py` (User) and `app/users/repository.py` (user lookups)
- **No bearer tokens in Authorization header** — cookies only
- **CORS**: must explicitly allowlist frontend origin and set `allow_credentials=True`

---

## 9. Testing Standards

Updated for Phase 2:

- Every endpoint must have at least one test (carried from Phase 1)
- Use `httpx.AsyncClient` with `ASGITransport` as the test client
- Test naming: `test_<action>_<scenario>`
- Tests live in `app/<domain>/tests/test_<domain>.py`
- Global fixtures in root `conftest.py`:
  - `async_client` — async HTTP test client
  - `db_session` — isolated async DB session for each test
- Test database: separate from production — configured via `TEST_DATABASE_URL` in `.env`
- Each test runs in a **transaction that is rolled back** after the test — no persistent state between tests
- No in-memory stores in Phase 2 tests — all tests hit the real test database

---

## 10. Naming Conventions

*(Unchanged from Phase 1)*

| Thing | Convention | Example |
|---|---|---|
| Files | snake_case | `router.py`, `repository.py` |
| Classes | PascalCase | `ProductCreate`, `Product` (ORM model) |
| Functions | snake_case | `get_product`, `create_product` |
| Constants | SCREAMING_SNAKE | `NOT_FOUND` |
| URL paths | kebab-case | `/api/v1/product-categories` |
| ORM models | plain noun | `User`, `Product`, `Category` |
| Pydantic schemas | noun + intent | `UserCreate`, `UserRead`, `UserUpdate` |

---

## 11. Phase Boundary

**Phase 1** ✅ Complete:
- FastAPI app, CRUD routes, Pydantic schemas, in-memory storage, endpoint tests

**Phase 2 includes:**
- `app/core/database.py` — async engine + session factory
- `app/core/deps.py` — `get_db` dependency
- `app/core/config.py` — pydantic-settings `Settings`
- `app/<domain>/models.py` — SQLAlchemy ORM model per domain
- `app/<domain>/repository.py` — DB queries per domain
- Updated `app/<domain>/service.py` — replace in-memory store calls with repository calls
- Alembic setup + initial migration
- `.env` + `.env.example`
- Updated `conftest.py` — test DB session with rollback isolation

**Phase 3 includes:**
- `app/core/security.py` — JWT encode/decode, bcrypt hash/verify
- `app/core/deps.py` — add `get_current_user` dependency
- `app/core/config.py` — add JWT env variables
- `app/auth/` — router, schemas, service, tests
- Alembic migration: no new tables (auth reuses `users` table — add `hashed_password` column if not present)
- CORS middleware added to `app/main.py`
- `.env` + `.env.example` updated with JWT variables

**Phase 3 does NOT include:**
- Social login (Google, GitHub)
- Email verification / magic links
- Password reset via email
- Role-based access control (RBAC)
- File storage
- Payment integration

These are deferred to Phase 4+.

---

---

## FRONTEND CONSTITUTION (Phase 4)

---

## F1. Frontend Identity

- **Framework**: Next.js 15 (App Router) — React Server Components by default
- **Language**: TypeScript (strict mode — no `any` without justification)
- **Styling**: Tailwind CSS v3 + shadcn/ui component library
- **Animations**: Framer Motion — **mandatory on every visible element**
- **Icons**: React Icons
- **Deployment**: Vercel (frontend) + Railway (backend)
- **Domain**: `irhapk.com` via Namecheap DNS → CNAME to Vercel
- **API**: FastAPI backend at `NEXT_PUBLIC_API_URL` (env var); production: Railway URL
- **Reference Design**: premiumwallartstudio.com — luxury ecommerce aesthetic

---

## F2. Frontend Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC by default, client components only when needed |
| Language | TypeScript 5.x | Strict mode, no untyped `any` |
| Styling | Tailwind CSS v3 | Utility-first, no inline styles |
| Components | shadcn/ui | Base component library |
| Animations | Framer Motion | Required everywhere |
| Icons | React Icons | ri- / fa- / hi- prefixes |
| State | Zustand | Cart, auth state, wishlist |
| HTTP Client | Axios | Centralized instance with interceptors |
| Fonts | Cormorant Garamond (headings) + Instrument Sans (body) | via next/font/google |
| Images | next/image | Required for all images — no raw `<img>` tags |
| Frontend Hosting | Vercel | Env vars in Vercel dashboard; auto-deploy from `irhapk/irha_beauty` |
| Backend Hosting | Railway | FastAPI, Python 3.12; auto-deploy from `irhapk/irha_beauty` |
| Domain | `irhapk.com` via Namecheap | DNS CNAME → Vercel; Railway subdomain for API |

---

## F3. Design System

### Color Palette (mandatory — no deviations)

| Token | Hex | Usage |
|---|---|---|
| `black` | `#000000` | Primary background, buttons |
| `gold` | `#ca9236` | Accent, highlights, hover states |
| `cream` | `#F5F3EB` | Light section backgrounds |
| `dark-brown` | `#4E423D` | Headings, primary text |
| `gray-mid` | `#555555` | Body text |
| `gray-light` | `#999999` | Captions, metadata |
| `white` | `#FFFFFF` | Cards, clean sections |

### Typography

| Element | Font | Weight | Transform |
|---|---|---|---|
| H1 / Hero | Cormorant Garamond | 700 | uppercase |
| H2 / Section titles | Cormorant Garamond | 600 | — |
| H3 / Card titles | Cormorant Garamond | 500 | — |
| Body / UI | Instrument Sans | 400 | — |
| Buttons / Labels | Instrument Sans | 600 | uppercase, letter-spacing 2px |
| Captions | Instrument Sans | 400 | — |

### Buttons (mandatory style)

- Border radius: `50px` (fully rounded)
- Padding: `12px 40px`
- Text: uppercase, `letter-spacing: 2px`, `font-size: 13px`
- Default: black background + white text + 1px black border
- Hover: white background + black text (300ms transition)
- Gold variant: gold background + white text (for accent CTAs)
- All buttons must have Framer Motion `whileHover` + `whileTap` scale

### Spacing

- Section padding: `80px 0` (desktop), `48px 0` (mobile)
- Container max-width: `1470px`, centered
- Card gap: `24px`
- Component internal padding: `24px–48px`

---

## F4. Project Structure (Next.js App Router)

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout — fonts, providers
│   ├── page.tsx                # Homepage
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── categories/
│   │   └── [slug]/page.tsx     # Category page (coming soon or product list)
│   ├── products/
│   │   ├── page.tsx            # All products
│   │   └── [id]/page.tsx       # Product detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── orders/page.tsx         # Order history (auth protected)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ScrollProgress.tsx
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── home/
│   │   ├── HeroCarousel.tsx
│   │   ├── CategoryGrid.tsx
│   │   └── FeaturedProducts.tsx
│   ├── product/
│   │   ├── ProductCard.tsx     # Dual-image hover card
│   │   └── ProductDetail.tsx
│   ├── cart/
│   │   └── CartDrawer.tsx
│   └── animations/
│       ├── ScrollReveal.tsx    # Reusable scroll-triggered wrapper
│       └── FadeIn.tsx
├── lib/
│   ├── api.ts                  # Axios instance + all API calls
│   └── utils.ts                # shadcn cn() + helpers
├── store/
│   ├── cart.store.ts           # Zustand cart store
│   └── auth.store.ts           # Zustand auth store
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── public/                     # Next.js static assets — add images here after app init
│   ├── logo.png
│   ├── banner-oils.jpg
│   ├── banner-shampoo.jpg
│   ├── banner-fragrance.jpg
│   ├── category-oils.jpg
│   ├── category-shampoo.jpg
│   ├── category-fragrance.jpg
│   ├── shampoo.jpg
│   └── shampoo-hover.jpg
├── .env.local                  # NEXT_PUBLIC_API_URL — never committed
├── .env.example                # Committed with placeholder values
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## F5. Animation Rules (Framer Motion — MANDATORY)

Every rule below is non-negotiable:

### Scroll Reveal (all sections)
- Every section, card, and content block must animate in on scroll
- Use `whileInView` + `viewport={{ once: true }}` — fires once, not on re-scroll
- Default entrance: `opacity: 0, y: 40` → `opacity: 1, y: 0` with `duration: 0.6`
- Stagger children using `staggerChildren: 0.15`
- **No element loads visible by default** — everything reveals on scroll

### Hero Carousel
- 3 slides (oils / shampoo / fragrance), auto-switch every 4 seconds
- Slide transition: `AnimatePresence` with `x: 100%` → `x: 0` → `x: -100%`
- Per-slide stagger: subtitle (200ms) → headline (500ms) → body (1200ms) → CTA button (1700ms)
- "Discover Now" button on each slide: pulse animation + `whileHover` scale + glow
- All text uses `initial={{ opacity:0, y:30 }}` → `animate={{ opacity:1, y:0 }}`

### Product Cards
- Entrance: scroll reveal with stagger in grid
- Image: primary image visible; secondary image fades in + scales slightly on hover
- Card: `whileHover={{ y: -8, boxShadow: "..." }}` with `duration: 0.3`
- Action buttons (cart, wishlist) slide up from bottom on hover

### Images
- Every image: entrance animation `scale: 1.05` → `scale: 1` with `duration: 0.8`
- Parallax effect on hero and section backgrounds using `useScroll` + `useTransform`

### Page Transitions
- Route changes: `AnimatePresence` with fade + slight upward movement

### Global Utilities
- `<ScrollReveal>` wrapper component — wrap any element for auto scroll animation
- `<FadeIn delay={n}>` wrapper — for sequenced loading elements

---

## F6. Component Rules

- **Server Components** by default — add `"use client"` only when needed (event handlers, hooks, animations)
- All Framer Motion components require `"use client"` — isolate animated parts
- **shadcn/ui** as the base for all form inputs, dialogs, dropdowns — never build raw HTML forms
- No inline styles — Tailwind classes only
- No raw `<img>` tags — always `next/image` with explicit `width` / `height` or `fill`
- Every interactive element needs both hover AND focus-visible states
- Components over 150 lines must be split

---

## F7. State Management (Zustand)

| Store | State | Actions |
|---|---|---|
| `cart.store.ts` | `items[]`, `total` | `addItem`, `removeItem`, `updateQty`, `clearCart` |
| `auth.store.ts` | `user`, `isAuthenticated` | `setUser`, `clearUser` |

- Cart persisted in `localStorage` via Zustand persist middleware
- Auth state hydrated from `GET /api/v1/auth/me` on app load
- No prop-drilling for cart or auth — always read from store

---

## F8. API Integration Rules

- Single Axios instance in `lib/api.ts` — `baseURL = process.env.NEXT_PUBLIC_API_URL`
- `withCredentials: true` on every request (required for httpOnly cookie auth)
- All API functions typed — no `any` return types
- Error handling: extract `{ detail, code }` from API error responses
- Auth: cookies handled automatically by browser — no manual token management in frontend
- Env variable: `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`

---

## F9. Image & Asset Rules

- All images live in `frontend/public/` — referenced as `/filename.jpg` in Next.js
- Product cards use two images: `shampoo.jpg` (default) + `shampoo-hover.jpg` (on hover)
- Hero banners: `banner-oils.jpg`, `banner-shampoo.jpg`, `banner-fragrance.jpg`
- Category cards: `category-oils.jpg`, `category-shampoo.jpg`, `category-fragrance.jpg`
- Logo: `logo.png` — used in header + footer
- All images served via `next/image` with `priority` on above-the-fold images
- Aspect ratios: hero `16:9`, category cards `1:1`, product cards `3:4`

---

## F10. Routing Conventions

| Route | Page | Auth required |
|---|---|---|
| `/` | Homepage | No |
| `/categories/shampoo` | Shampoo product list | No |
| `/categories/oils` | Coming Soon | No |
| `/categories/fragrance` | Coming Soon | No |
| `/products` | All products | No |
| `/products/[id]` | Product detail | No |
| `/cart` | Cart | No |
| `/checkout` | Checkout | Yes |
| `/orders` | Order history | Yes |
| `/login` | Login | No (redirect if logged in) |
| `/register` | Register | No (redirect if logged in) |
| `/about` | About Us | No |
| `/contact` | Contact | No |

- Protected routes redirect to `/login` if unauthenticated
- Already-authed users on `/login` or `/register` redirect to `/`
- Slug-based category routing — `[slug]` maps to `oils`, `fragrance`, `shampoo`

---

## F11. Frontend Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProductCard.tsx`, `HeroCarousel.tsx` |
| Pages | `page.tsx` | Next.js App Router convention |
| Hooks | `use` prefix, camelCase | `useCart`, `useAuth` |
| Stores | camelCase + `.store.ts` | `cart.store.ts` |
| Types/interfaces | PascalCase | `Product`, `CartItem`, `User` |
| CSS classes | Tailwind utilities | no custom class names unless necessary |
| Event handlers | `handle` prefix | `handleAddToCart`, `handleSubmit` |
| API functions | verb + noun | `fetchProducts`, `createOrder`, `loginUser` |
| Env variables | `NEXT_PUBLIC_` prefix | `NEXT_PUBLIC_API_URL` |

---

## F12. Frontend Phase Boundary (Phase 4)

**Phase 4 includes:**
- Homepage (hero carousel, categories, featured product)
- Category pages (shampoo live, oils/fragrance coming soon)
- Product detail page
- Cart (Zustand-persisted)
- Checkout (COD only)
- Auth pages (login, register — connected to FastAPI backend)
- About + Contact pages
- Full animation system (Framer Motion scroll reveal, hero, cards)
- Responsive (mobile-first, breakpoints: 480px, 768px, 1024px, 1470px)

**Phase 4 does NOT include:**
- Stripe payments (deferred)
- Admin panel (deferred)
- Product reviews (deferred)
- Wishlist persistence in DB (localStorage only for now)
- Email notifications
- Search / filter

---

## Governance

- This constitution supersedes all other practices for all phases.
- Amendments require: a proposed change, ratification note, and version bump.
- All specs, plans, tasks, and code reviews must cite compliance with this constitution.

**Version**: v4.1.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-03-02 — Deployment updated: Vercel + Railway + irhapk.com; GitHub repo: irhapk/irha_beauty
