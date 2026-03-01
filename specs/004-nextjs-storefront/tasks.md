# Tasks: Irha Beauty Frontend Storefront (004-nextjs-storefront)

**Branch**: `004-nextjs-storefront`
**Constitution**: v4.0.0
**Quality mandate**: Clean, scalable, senior-developer standard — typed, composable, no shortcuts.

---

## Code Quality Rules (apply to every task)

- TypeScript strict — no `any`, no `as unknown as X` shortcuts
- All functions typed with explicit return types
- Components ≤ 150 lines — split if longer
- No inline styles — Tailwind classes only
- No raw `<img>` — always `next/image`
- No prop-drilling past 2 levels — use Zustand stores
- Every magic number or string extracted as a named constant
- Barrel exports from each folder (`index.ts`)
- `cn()` for all conditional class merging
- Error boundaries on all async data-fetching components
- Git-committable at every phase checkpoint

---

## Phase 1: Backend — Orders Domain (Prerequisite)

**Purpose**: The frontend checkout and order history require a backend orders endpoint. This must be done before any frontend checkout work.

- [X] T001 Add `Order` and `OrderItem` SQLAlchemy models to `backend/app/orders/models.py`:
  - `Order`: id, user_id (nullable FK → users), customer_name, address, city, phone, payment_method (default "cod"), total_amount, status (default "pending"), created_at
  - `OrderItem`: id, order_id (FK → orders CASCADE), product_id (FK → products RESTRICT), quantity, unit_price

- [X] T002 Generate and apply Alembic migration: written manually as `a1b2c3d4e5f6_add_orders_and_order_items.py` (autogenerate unavailable — asyncpg hangs on Python 3.14 + broken WMI). SQL generated via `alembic upgrade head --sql`. **Apply to NeonDB via console** (see SQL block in Phase 1 checkpoint below).

- [X] T003 Create `backend/app/orders/schemas.py`:
  - `OrderItemIn`: product_id, quantity, unit_price
  - `OrderItemRead`: product_id, quantity, unit_price
  - `CreateOrderRequest`: customer_name, address, city, phone, items: list[OrderItemIn], payment_method (literal "cod"), total_amount
  - `OrderRead`: id, customer_name, address, city, phone, items, payment_method, total_amount, status, created_at, user_id

- [X] T004 Create `backend/app/orders/repository.py`:
  - `create_order(db, data, user_id) → Order` — inserts order + order_items atomically
  - `get_orders_by_user(db, user_id) → list[Order]` — ordered by created_at DESC, eager-loads items

- [X] T005 Create `backend/app/orders/service.py`:
  - `create_order(db, data, current_user | None, response) → OrderRead` — validates product IDs exist, calls repository
  - `get_my_orders(db, current_user) → list[OrderRead]`

- [X] T006 Create `backend/app/orders/router.py`:
  - `POST /orders` — auth optional (uses `get_current_user` with `try/except` for guest support), returns `201 OrderRead`
  - `GET /orders/my` — auth required, returns `200 list[OrderRead]`

- [X] T007 Register orders router in `backend/app/main.py`: `app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])`

- [X] T008 Create `backend/app/orders/__init__.py` and `backend/app/orders/tests/__init__.py`

- [X] T009 Write `backend/app/orders/tests/test_orders.py`:
  - `test_create_order_guest` — 201, no auth cookie
  - `test_create_order_authenticated` — 201, order linked to user
  - `test_get_my_orders_authenticated` — 200, returns user's orders
  - `test_get_my_orders_unauthenticated` — 401 NOT_AUTHENTICATED

- [X] T010 Run full backend pytest: **53/53 pass** (49 existing + 4 new order tests)

**Checkpoint ✅**: Backend orders domain live. `POST /api/v1/orders` and `GET /api/v1/orders/my` operational.

---

## Phase 2: Frontend Initialisation & Config

**Purpose**: Bootstrap the Next.js app, configure Tailwind theme, fonts, env, and rewrite proxy. Everything downstream depends on this.

- [X] T011 Initialise Next.js app inside `frontend/` from the repo root (installed Next.js 16.1.6 + React 19 + Tailwind v4 — latest stable). Deleted boilerplate: page.tsx cleared, public SVGs removed.

- [X] T012 Install all dependencies: framer-motion, zustand, axios, react-icons installed. shadcn@3.8.5 initialized (auto-detected Tailwind v4). Components added: button, input, label, dialog, sheet, badge, separator.

- [X] T013 Design tokens added to `frontend/app/globals.css` via `@theme inline` (Tailwind v4 approach — no tailwind.config.ts needed): gold, cream, dark-brown, gray-mid, gray-light colors; heading + body font families; --width-container: 1470px.

- [X] T014 Configure `frontend/next.config.ts` with API rewrite proxy: `source: '/api/:path*'` → `${NEXT_PUBLIC_API_URL}/api/:path*`

- [X] T015 Created `frontend/.env.local` (gitignored) and `frontend/.env.example` (committed): `NEXT_PUBLIC_API_URL=http://localhost:8000`

- [X] T016 Configured Google Fonts in `frontend/app/layout.tsx`: Cormorant_Garamond (400/500/600/700) + Instrument_Sans (400/600) via next/font/google. CSS variables --font-cormorant and --font-instrument-sans applied to `<html>`.

**Checkpoint ✅**: `npm run build` passes cleanly. Tailwind v4 tokens, Cormorant+Instrument fonts, and API proxy all ready.

---

## Phase 3: Shared Foundation

**Purpose**: Types, API client, Zustand stores, animation wrappers, and provider tree. Every other component depends on these.

- [X] T017 Create `frontend/types/index.ts` — 9 interfaces: Product, Category, CartItem, User, OrderItemIn, CreateOrderPayload, Order, Slide, ApiError.

- [X] T018 Update `frontend/lib/utils.ts` — cn() from shadcn preserved; added formatPrice (PKR locale) + formatDate (en-GB short).

- [X] T019 Create `frontend/lib/api.ts` — Axios instance (baseURL /api, withCredentials). 401 interceptor with refresh-and-retry (_retry flag via module augmentation). 9 typed API functions: registerUser, loginUser, logoutUser, fetchCurrentUser, fetchProducts, fetchProduct, fetchCategories, fetchCategory, createOrder, fetchMyOrders.

- [X] T020 Create `frontend/store/cart.store.ts` — Zustand v5 + persist (skipHydration: true, name: 'irha-cart'). addItem deduplicates by incrementing qty. useCartTotal + useCartCount derived selectors.

- [X] T021 Create `frontend/store/auth.store.ts` — Zustand v5, no persistence. State: user, isAuthenticated, isLoading. Actions: setUser, clearUser, setLoading.

- [X] T022 [P] Create `frontend/components/providers/AuthProvider.tsx` — on mount: fetchCurrentUser → setUser; on error: clearUser. setLoading wraps both. Renders children.

- [X] T023 [P] Create `frontend/components/providers/StoreProvider.tsx` — on mount: useCartStore.persist.rehydrate(). Renders children.

- [X] T024 Create `frontend/components/providers/Providers.tsx` — StoreProvider wraps AuthProvider wraps children. Single import for layout.tsx.

- [X] T025 Create `frontend/components/animations/ScrollReveal.tsx` — whileInView stagger container + exported scrollItemVariants (y: 40→0, 0.6s easeOut).

- [X] T026 Create `frontend/components/animations/FadeIn.tsx` — initial/animate (not whileInView). Direction-aware: up/down/left/right offset. 0.6s easeOut.

- [X] T027 Create `frontend/components/animations/PageTransition.tsx` — AnimatePresence mode="wait", pathname as key, y: 20→0→-20, 0.3s.

- [X] T028 Barrel exports: components/animations/index.ts, store/index.ts.

**Checkpoint ✅**: All shared utilities, stores, and animation wrappers built. `npm run build` passes — TypeScript clean.

---

## Phase 4: Layout Shell

**Purpose**: Fixed header, dark footer, scroll progress bar, scroll-to-top button. Visible on every page.

- [X] T029 Create `frontend/components/layout/ScrollProgress.tsx` (`"use client"`):
  - Uses `useScroll()` from Framer Motion → `scaleX` transforms to drive a `motion.div` at the top of the viewport
  - Fixed position, z-index above header, gold colour (`bg-gold`), height 3px
  - `transformOrigin: 'left'`

- [X] T030 Create `frontend/components/layout/ScrollToTop.tsx` (`"use client"`):
  - Appears after 100px scroll (`useScroll` or `window.scrollY`)
  - `AnimatePresence` fade in/out
  - Click: `window.scrollTo({ top: 0, behavior: 'smooth' })`
  - Fixed bottom-right, black circle button, gold arrow icon

- [X] T031 Create `frontend/components/layout/CartIcon.tsx` (`"use client"`):
  - Reads `items` from `useCartStore` — shows count badge when > 0
  - Badge animates scale-in on item add (`AnimatePresence`)
  - Links to `/cart`

- [X] T032 Create `frontend/components/layout/Header.tsx` (`"use client"`):
  - Fixed top, full-width, dark background (`bg-black`), z-index 50
  - Three zones: logo (left) + nav links (centre) + icons (right)
  - Logo: `next/image` with `/logo.png`, links to `/`
  - Nav links: Home, Shop, Categories (dropdown: Shampoo, Oils, Fragrance), About, Contact
  - Icons: `<CartIcon />` + auth (shows user name + logout if logged in, or Login/Register links)
  - Mobile: hamburger menu using shadcn `<Sheet>` — slides in from right
  - Active link highlighted with gold underline (`usePathname()`)
  - Scroll effect: adds `backdrop-blur` + slight transparency after 50px scroll

- [X] T033 Create `frontend/components/layout/Footer.tsx`:
  - Dark background (`bg-black text-white`)
  - Four columns: Brand (logo + tagline), Quick Links, Categories, Connect (socials + newsletter)
  - Newsletter: email input + subscribe button (shadcn `<Input>` + `<Button>`)
  - Social icons via React Icons (Instagram, Facebook, WhatsApp, Pinterest)
  - Bottom bar: copyright text
  - All link groups animated with `ScrollReveal`

- [X] T034 Update `frontend/app/layout.tsx`:
  - Load fonts, apply CSS variables to `<html>`
  - Render: `<Providers>` → `<ScrollProgress>` + `<Header>` + `<PageTransition>{children}</PageTransition>` + `<Footer>` + `<ScrollToTop>`
  - `<PageTransition>` wraps `{children}` — must be client component
  - Metadata: `title: 'Irha Beauty'`, `description: 'Luxury hair care products'`

**Checkpoint ✅**: App shell renders on every route. Header, footer, scroll progress all visible and animated.

---

## Phase 5: Homepage

**Purpose**: The primary landing experience — hero carousel, category grid, featured product section.

- [X] T035 Create `frontend/lib/slides.ts` — static carousel data (single source of truth):
  ```ts
  export const SLIDES: Slide[] = [
    { id: 1, category: 'shampoo', bannerImage: '/banner-shampoo.jpg', subtitle: 'QUALITY YOU CAN FEEL', headline: 'Nourish. Restore. Shine.', body: 'Premium Argan-infused shampoo crafted for silky, healthy hair.', ctaHref: '/categories/shampoo' },
    { id: 2, category: 'oils', bannerImage: '/banner-oils.jpg', subtitle: 'PURE LUXURY', headline: 'Nature\'s Finest Oils', body: 'Cold-pressed, pure hair oils for ultimate nourishment.', ctaHref: '/categories/oils' },
    { id: 3, category: 'fragrance', bannerImage: '/banner-fragrance.jpg', subtitle: 'SIGNATURE SCENTS', headline: 'Wear Your Story', body: 'Timeless fragrances that leave a lasting impression.', ctaHref: '/categories/fragrance' },
  ]
  ```

- [X] T036 Create `frontend/components/home/HeroCarousel.tsx` (`"use client"`):
  - State: `currentIndex: number`, `direction: number` (1=forward, -1=backward)
  - Directional variants: `enter(dir)`, `center`, `exit(dir)` with x offset + opacity
  - `AnimatePresence mode="wait" custom={direction}`
  - Per-slide staggered text: subtitle (delay 0.2s), headline (0.5s), body (1.2s), CTA button (1.7s) — each `motion.div` with `initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}`
  - "Discover Now" button: pulsing gold ring animation (`animate={{ boxShadow }}`) + `whileHover` scale
  - Auto-advance: `useEffect` → `setInterval(4000)` → `clearInterval` cleanup; paused on hover via `isPaused` ref
  - Dot navigation below: click to jump to slide with correct direction
  - Arrow buttons (left/right) for manual navigation
  - Background: dark overlay (40% opacity) over `next/image` with `fill` + `priority` + `objectFit="cover"`
  - Full-viewport height: `min-h-screen`

- [X] T037 Create `frontend/components/home/CategoryGrid.tsx`:
  - Accepts `categories: Category[]`
  - 3-column grid on desktop, 1-column on mobile
  - Each card: `next/image` category image (square `aspect-square`) + dark overlay + category name centered + status badge
  - "Coming Soon" categories: overlay slightly darker + badge — still links to their page
  - Whole card is a `<Link>` to `/categories/[slug]`
  - Entrance: `<ScrollReveal>` with stagger
  - Card hover: `motion.div whileHover={{ scale: 1.03 }}` with image subtle scale-up via CSS `group-hover:scale-105 transition-transform duration-700`

- [X] T038 Create `frontend/components/home/FeaturedProducts.tsx`:
  - Fetches products from store or accepts `products: Product[]` as prop
  - Section heading with `<FadeIn>` + gold underline accent
  - Renders `<ProductCard>` components in a grid
  - "View All" button linking to `/products`
  - `<ScrollReveal>` on the product grid

- [X] T039 Create `frontend/app/page.tsx` (Server Component — fetches data):
  - Calls `fetchProducts()` and `fetchCategories()` server-side
  - Renders: `<HeroCarousel />` + `<CategoryGrid categories={...} />` + `<FeaturedProducts products={...} />`
  - Wrap data-fetching in `try/catch` with graceful fallback UI

**Checkpoint ✅**: Homepage renders with all 3 sections. Carousel auto-advances. Scroll animations fire.

---

## Phase 6: Category Pages & Product Pages

**Purpose**: Category listing, product grid with dual-image hover, and full product detail page.

- [X] T040 Create `frontend/components/product/ProductCard.tsx` (`"use client"`):
  - Props: `product: Product`
  - Outer: `motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}`
  - Image container: `group relative overflow-hidden aspect-[3/4]`
  - Primary image: `absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500`
  - Hover image: `absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`
  - Both use `next/image` with `fill` + `objectFit="cover"`
  - Actions overlay: `absolute bottom-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out`
  - Actions: "Add to Cart" button (calls `useCartStore.addItem`) + wishlist icon
  - Info: product name (`font-heading`), price (`formatPrice(product.price)`)
  - Card is a `<Link>` to `/products/[id]` (clicking image navigates; Add to Cart is separate button)

- [X] T041 Create `frontend/app/categories/[slug]/page.tsx` (Server Component):
  - Fetches `fetchCategory(slug)` and `fetchProducts(slug)` server-side
  - If category status is `coming-soon`: render `<ComingSoon category={category} />`
  - If active: render product grid with `<ProductCard>` wrapped in `<ScrollReveal>`
  - Page heading with `<FadeIn>` + breadcrumb
  - Generate static params for SEO: `generateStaticParams` for known slugs

- [X] T042 Create `frontend/components/product/ComingSoon.tsx`:
  - Accepts `category: Category`
  - Full-screen or tall section with background image + dark overlay
  - Animated text: "Coming Soon" in large heading font
  - Subtitle describing the category
  - CTA: "Back to Homepage" button + "Notify Me" email field (UI only — no backend in Phase 4)
  - All elements use `<FadeIn>` with sequenced delays

- [X] T043 Create `frontend/app/products/page.tsx` (Server Component):
  - Fetches all products server-side
  - Renders grid of `<ProductCard>` in `<ScrollReveal>`
  - Page heading + breadcrumb with `<FadeIn>`

- [X] T044 Create `frontend/components/product/ProductDetail.tsx` (`"use client"`):
  - Props: `product: Product`
  - Left column: image switcher (primary + hover with click/hover toggle) + thumbnail strip
  - Right column: category label, product name, price, description, quantity selector, "Add to Cart" button, share icons
  - "Add to Cart": animates the button briefly (scale + color flash) on click, calls `useCartStore.addItem`
  - Image entrance: `<FadeIn direction="left">` for image, `<FadeIn direction="right">` for info

- [X] T045 Create `frontend/app/products/[id]/page.tsx` (Server Component):
  - Fetches `fetchProduct(id)` server-side
  - Renders `<ProductDetail product={product} />`
  - `generateMetadata` for dynamic SEO title/description
  - `notFound()` if product fetch returns 404

**Checkpoint ✅**: Category pages work (shampoo=live, oils/fragrance=coming-soon). Product card dual-image hover works. Product detail page works.

---

## Phase 7: Cart

**Purpose**: Cart page and header icon with real-time Zustand state.

- [X] T046 Create `frontend/app/cart/page.tsx` (`"use client"`):
  - Reads from `useCartStore`
  - Empty cart: animated empty state with illustration/icon and CTA to shop
  - Item rows: product image + name + unit price + quantity selector (`-` / `+` buttons) + remove button + line total
  - Quantity buttons: `whileHover` scale + `whileTap` scale
  - Remove: `AnimatePresence` — item animates out (height 0 + opacity 0) on removal
  - Order summary: subtotal, note about free delivery, **total in PKR**
  - "Proceed to Checkout" button → `/checkout`
  - "Continue Shopping" link → `/products`
  - All elements animate in with `<ScrollReveal>`

- [X] T047 Verify `<CartIcon>` badge updates correctly when items added/removed (T031 dependency). Test by adding item on product page → navigating to header — badge must show correct count without page reload.

**Checkpoint ✅**: Cart persists across navigation and browser refreshes. Animations on add/remove work.

---

## Phase 8: Checkout & Order History

**Purpose**: COD checkout form, order submission, confirmation, and authenticated order history.

- [X] T048 Create `frontend/components/checkout/CheckoutForm.tsx` (`"use client"`):
  - Form fields (shadcn `<Input>` + `<Label>`): Full Name, Address, City, Phone
  - Validation: all fields required, phone min 10 digits — inline error messages
  - Payment section: shows "Cash on Delivery" with a tick icon — no card fields
  - "Place Order" button: loading state during submission (`isSubmitting` state)
  - On submit: build `CreateOrderPayload` from form + cart items, call `createOrder(payload)`, on success: `clearCart()` + navigate to `/orders?confirmed=true`
  - On API error: show error message inline

- [X] T049 Create `frontend/app/checkout/page.tsx` (`"use client"`):
  - Guard: if `!isAuthenticated && items.length === 0` → redirect to `/cart`
  - Two-column layout (desktop): form left, order summary right
  - Order summary: list cart items with image, name, qty, price
  - Total clearly visible in PKR
  - All sections animate in with `<FadeIn>`

- [X] T050 Create `frontend/app/orders/page.tsx` (`"use client"`):
  - Auth guard: if `!isAuthenticated` → redirect to `/login`
  - On mount: call `fetchMyOrders()` → display list
  - Loading state: skeleton cards using shadcn `<Skeleton>`
  - Empty state: friendly animated message
  - Order cards: order ID, date (`formatDate`), status badge (colour-coded), items summary, total
  - `?confirmed=true` query param: show animated success banner at top ("Your order has been placed!")
  - `<ScrollReveal>` on order list

**Checkpoint ✅**: COD order submission works end-to-end. Order appears in history when logged in.

---

## Phase 9: Auth Pages

**Purpose**: Login and register pages connected to the FastAPI backend.

- [X] T051 Create `frontend/components/auth/AuthForm.tsx` (`"use client"`):
  - Reusable base for both login and register
  - Props: `mode: 'login' | 'register'`, `onSubmit`, `isLoading`, `error`
  - Register shows: Full Name, Email, Password (with show/hide toggle)
  - Login shows: Email, Password (with show/hide toggle)
  - All inputs use shadcn `<Input>` + `<Label>`
  - Inline validation: password min 8 chars, valid email format
  - Submit button: loading spinner when `isLoading`
  - Error message: animates in with `<FadeIn>`

- [X] T052 Create `frontend/app/(auth)/register/page.tsx` (`"use client"`):
  - Auth guard: if `isAuthenticated` → redirect to `/`
  - On submit: calls `registerUser(data)` → `setUser(response)` → navigate to `/`
  - Luxury split-screen layout: left = brand imagery + tagline, right = form
  - All elements enter with `<FadeIn>` with sequential delays

- [X] T053 Create `frontend/app/(auth)/login/page.tsx` (`"use client"`):
  - Auth guard: if `isAuthenticated` → redirect to `/`
  - On submit: calls `loginUser(data)` → `setUser(response)` → navigate to `/`
  - Same split-screen luxury layout as register
  - "Don't have an account?" link to `/register`

**Checkpoint ✅**: Register auto-logs in and redirects. Login works. Logged-in users redirected away from auth pages.

---

## Phase 10: About & Contact Pages

**Purpose**: Brand story and contact form — static but fully animated.

- [X] T054 Create `frontend/app/about/page.tsx`:
  - Hero section: full-width image + brand name overlay with `<FadeIn>`
  - Brand story section: headline + 2-3 paragraphs, `<ScrollReveal>`
  - Values section: 3-column grid (Quality, Luxury, Trust) with icons and text, `<ScrollReveal stagger={0.15}>`
  - CTA section: "Discover Our Products" button linking to `/products`

- [X] T055 Create `frontend/components/contact/ContactForm.tsx` (`"use client"`):
  - Fields: Name, Email, Message (textarea)
  - Validation: all required, valid email
  - Submit: shows success state ("Thank you! We'll be in touch.") with animation
  - No backend call in Phase 4 — UI only with `setTimeout` simulation

- [X] T056 Create `frontend/app/contact/page.tsx`:
  - Two-column layout: left = contact info (phone, email, social links), right = `<ContactForm />`
  - Info column: React Icons for each contact method
  - All sections `<ScrollReveal>`

**Checkpoint ✅**: About and Contact pages render with full animations.

---

## Phase 11: Polish, Responsiveness & Final Validation

**Purpose**: Responsive audit, animation pass, image fallbacks, SEO metadata, and final build check.

- [X] T057 Add responsive classes to all components:
  - Header: hamburger on mobile (`md:hidden` / `hidden md:flex`)
  - HeroCarousel: font sizes scale (`text-4xl md:text-6xl lg:text-8xl`)
  - CategoryGrid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - ProductCard: appropriate sizes on all breakpoints
  - Footer: stacked on mobile, 4-column on desktop (`grid-cols-1 md:grid-cols-4`)
  - Checkout: single column on mobile, two-column on desktop (`lg:grid-cols-2`)

- [X] T058 Add `next/image` blur placeholder to all product and banner images:
  - `placeholder="blur" blurDataURL="data:image/jpeg;base64,..."` for external images
  - For `/public` images use `placeholder="blur"` with `blurDataURL` generated via sharp or a base64 utility

- [X] T059 Add global metadata to `frontend/app/layout.tsx`:
  ```ts
  export const metadata: Metadata = {
    title: { default: 'Irha Beauty', template: '%s | Irha Beauty' },
    description: 'Premium luxury hair care — Argan shampoos, pure oils, signature fragrances.',
    keywords: ['hair care', 'shampoo', 'argan oil', 'luxury beauty', 'Pakistan'],
    openGraph: { ... }
  }
  ```

- [X] T060 Add `generateMetadata` to product detail and category pages for dynamic SEO

- [X] T061 Create `frontend/app/not-found.tsx`:
  - Animated 404 page with brand styling
  - Large "404" in gold, message, CTA back to homepage

- [X] T062 Add `loading.tsx` files for route-level suspense:
  - `frontend/app/loading.tsx` — full-page skeleton
  - `frontend/app/products/loading.tsx` — product grid skeleton
  - `frontend/app/categories/[slug]/loading.tsx` — category skeleton

- [X] T063 Audit all `"use client"` usage — verify no unnecessary client components. Server-fetch pages must not be converted to client accidentally.

- [X] T064 Run `npm run build` — zero TypeScript errors, zero ESLint errors, zero build warnings. Fix all issues found.

- [X] T065 Run `npm run dev` and manually verify all 9 quickstart scenarios pass:
  - [X] S1: Hero carousel auto-advances, text stagger animates
  - [X] S2: Dual-image hover on ProductCard works
  - [X] S3: Oils + Fragrance show Coming Soon
  - [X] S4: COD checkout posts to backend, confirmation shows
  - [X] S5: Register auto-logs in
  - [X] S6: Login/logout cycle works
  - [X] S7: Order history shows for authenticated user
  - [X] S8: Cart persists after refresh
  - [X] S9: Page transition animates between routes

**Final checkpoint ✅**: `npm run build` passes. All 9 scenarios verified. Backend: 53/53 tests pass.

---

## Phase 12 — Homepage Enhancements (Reviews + Top Product)

> **Scope**: Two new homepage sections added post-Phase-11.
> **Refs**: FR-032, FR-033, FR-034, FR-035

### T066 — Reviews data + static config
- [X] T066 Create `frontend/lib/reviews.ts` with `REVIEWS` constant array
  - Each entry: `{ name, designation, image, rating, text }`
  - Three reviewers: Anus Butt (AI Engineer), Furqan Tufail (Admin Manager), Noor Abro (Social Media Executive)
  - All five-star ratings, review text specific to Oil Control Facewash
  - Image paths reference `/public/` files

### T067 — ReviewsCarousel component
- [X] T067 Create `frontend/components/home/ReviewsCarousel.tsx`
  - Auto-advances every 5 seconds via `useEffect` interval
  - Animated slide transitions using Framer Motion (`AnimatePresence` + `motion.div`)
  - Displays: reviewer photo (circular, `next/image`), name, designation, star rating (gold), review text
  - Dot navigation — clicking a dot jumps to that review
  - Pauses auto-advance on dot click, resumes after 5s
  - Fully responsive (single column mobile, centred on desktop)
  - Scroll-triggered entrance for the section wrapper (`ScrollReveal`)

### T068 — TopProduct component
- [X] T068 Create `frontend/components/home/TopProduct.tsx`
  - Displays product image (left/top) + content (right/bottom) in a two-column layout
  - Content: "Top Product" badge, product name, price, full description with ingredients list
  - Key ingredient pills/tags (Oil Control, Vitamin E, Botanical Extracts, Deep Cleanse, Matte Finish)
  - Add to Cart button wired to `useCartStore`
  - Scroll-triggered entrance animations on all elements
  - Uses FEATURED_PRODUCTS[0] as data source

### T069 — Wire sections into homepage
- [X] T069 Add `ReviewsCarousel` and `TopProduct` to `frontend/app/page.tsx`
  - `TopProduct` placed after FeaturedProducts section
  - `ReviewsCarousel` placed after TopProduct (above footer)
  - Verify no hydration mismatch (mounted guard if needed)
  - Verify `npm run dev` renders both sections correctly

---

## Dependencies & Execution Order

```
Phase 1 (Backend) must complete before Phase 8 (Checkout)
Phase 2 (Init) must complete before everything else
Phase 3 (Foundation) must complete before Phases 4-11
Phase 4 (Layout) must complete before Phase 5-11 (layout wraps all pages)
T022 ‖ T023 ‖ T024 (providers — parallel, different files)
T025 ‖ T026 ‖ T027 (animation wrappers — parallel, different files)
Phase 5 (Homepage) before Phase 6 (Categories) — HeroCarousel/CategoryGrid used on homepage
T040 (ProductCard) before T041, T043 (pages that use it)
Phase 7 (Cart) before Phase 8 (Checkout uses cart state)
Phase 9 (Auth) can be done in parallel with Phase 7-8
Phase 10 (About/Contact) can be done in parallel with Phase 7-9
Phase 11 (Polish) must be last
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 69 (T001–T069) |
| Backend tasks | 10 (T001–T010) |
| Frontend init | 6 (T011–T016) |
| Foundation | 12 (T017–T028) |
| Layout shell | 6 (T029–T034) |
| Homepage | 5 (T035–T039) |
| Category + Product | 6 (T040–T045) |
| Cart | 2 (T046–T047) |
| Checkout + Orders | 3 (T048–T050) |
| Auth pages | 3 (T051–T053) |
| About + Contact | 3 (T054–T056) |
| Polish | 9 (T057–T065) |
| Reviews + Top Product | 4 (T066–T069) |
| New backend tests | 4 |
| Backend test target | 53/53 |
| Parallel opportunities | T022‖T023‖T024, T025‖T026‖T027, Phase 9‖Phase 10 |
