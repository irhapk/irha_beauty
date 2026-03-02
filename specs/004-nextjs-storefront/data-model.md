# Data Model: 004-nextjs-storefront

**Date**: 2026-02-28

---

## Frontend Types (TypeScript interfaces in `types/index.ts`)

### Product
```ts
interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number           // PKR, integer (e.g. 499)
  image: string           // filename: "shampoo_one.png"
  hoverImage: string      // filename: "shampoo_two.png"
  category: string        // "facewash" | "oils" | "shampoo" | "fragrance"
  inStock: boolean
}
```

### Category
```ts
interface Category {
  id: number
  name: string
  slug: string            // "facewash" | "oils" | "shampoo" | "fragrance"
  status: "active" | "coming-soon"
  bannerImage: string     // "facewash_banner.png"
  categoryImage: string   // "facewash_category.png"
}
```

### CartItem
```ts
interface CartItem {
  productId: number
  name: string
  image: string
  price: number
  quantity: number
}
```

### CartState (Zustand store)
```ts
interface CartState {
  items: CartItem[]
  total: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQty: (productId: number, quantity: number) => void
  clearCart: () => void
}
```

### AuthState (Zustand store)
```ts
interface User {
  id: number
  full_name: string
  email: string
  created_at: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}
```

### Order
```ts
interface OrderItem {
  product_id: number
  quantity: number
  unit_price: number
}

interface OrderItemIn {
  product_id: number
  quantity: number
  unit_price: number
}

// Read schema — returned by API, includes product name
interface OrderItemRead {
  product_id: number
  product_name: string    // joined from products table
  quantity: number
  unit_price: number
}

interface CreateOrderPayload {
  customer_name: string
  email: string
  address: string
  city: string
  phone: string
  items: OrderItemIn[]
  payment_method: "cod"
  total_amount: number
}

interface Order {
  id: number
  user_id: number | null
  customer_name: string
  email: string
  address: string
  city: string
  phone: string
  items: OrderItemRead[]   // includes product_name
  payment_method: string
  total_amount: number
  status: "pending" | "processing" | "delivered" | "cancelled"
  created_at: string
}
```

### Slide (Hero Carousel)
```ts
interface Slide {
  id: number
  category: string           // "facewash" | "oils" | "shampoo" | "fragrance"
  bannerImage: string        // "facewash_banner.png"
  subtitle: string           // "PURE SKIN. PURE CONFIDENCE."
  headline: string           // "Cleanse. Glow. Shine."
  body: string               // Supporting copy
  ctaLabel: string           // "Discover Now"
  ctaHref: string            // "/categories/facewash"
}
```

---

## Backend — New Domain Required

### Orders domain (FastAPI — minimal MVP)

**New table**: `orders`
```
id              SERIAL PRIMARY KEY
user_id         INTEGER NULLABLE → FK users(id) ON DELETE SET NULL
customer_name   VARCHAR(150) NOT NULL
email           VARCHAR(255) NOT NULL
address         VARCHAR(300) NOT NULL
city            VARCHAR(100) NOT NULL
phone           VARCHAR(20)  NOT NULL
payment_method  VARCHAR(20)  NOT NULL DEFAULT 'cod'
total_amount    NUMERIC(10,2) NOT NULL
status          VARCHAR(20)  NOT NULL DEFAULT 'pending'
created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
```

**New table**: `order_items`
```
id          SERIAL PRIMARY KEY
order_id    INTEGER NOT NULL → FK orders(id) ON DELETE CASCADE
product_id  INTEGER NOT NULL → FK products(id) ON DELETE RESTRICT
quantity    INTEGER NOT NULL CHECK (quantity > 0)
unit_price  NUMERIC(10,2) NOT NULL
```
Note: `product_name` is NOT stored — it is joined from `products.name` at query time via SQLAlchemy relationship (`lazy="selectin"`) and exposed as a `@property` on the `OrderItem` model.

**Alembic migration**: `add_orders_and_order_items`

---

## Static Data (hardcoded in frontend for Phase 4)

Products and categories are fetched from the FastAPI backend at `/api/v1/products` and `/api/v1/categories`. No static JSON files — always fetched from API.

### Seed data (already in NeonDB or to be seeded):
```
Category: { name: "Facewash",  slug: "facewash",  status: "active" }
Category: { name: "Shampoo",   slug: "shampoo",   status: "coming-soon" }
Category: { name: "Hair Oils", slug: "oils",       status: "coming-soon" }
Category: { name: "Fragrance", slug: "fragrance",  status: "coming-soon" }

Product: {
  name: "Irha's Oil Control Facewash",
  price: 499,
  category: "facewash",
  description: "Advanced oil control facewash enriched with Vitamin E. Deeply cleanses pores, eliminates excess sebum, and keeps skin fresh and matte all day.",
  image: "shampoo_one.png",
  hoverImage: "shampoo_two.png"
}
```

### Static data (frontend/lib/static-data.ts — used until backend returns slug/image fields):
```
STATIC_CATEGORIES:
  { id: 4, name: "Facewash",  slug: "facewash",  status: "active",       bannerImage: "/facewash_banner.png",    categoryImage: "/facewash_category.png" }
  { id: 1, name: "Shampoo",   slug: "shampoo",   status: "coming-soon",  bannerImage: "/shampoo_banner.png",     categoryImage: "/shampoo_category.png" }
  { id: 2, name: "Hair Oils", slug: "oils",       status: "coming-soon",  bannerImage: "/oil_banner.png",         categoryImage: "/oil_category.png" }
  { id: 3, name: "Fragrance", slug: "fragrance",  status: "coming-soon",  bannerImage: "/fragrance_banner.png",   categoryImage: "/fragrance_category.png" }

SLIDES:
  { id: 1, category: "facewash",  bannerImage: "/facewash_banner.png",  ctaHref: "/categories/facewash" }
  { id: 2, category: "oils",      bannerImage: "/oil_banner.png",       ctaHref: "/categories/oils" }
  { id: 3, category: "shampoo",   bannerImage: "/shampoo_banner.png",   ctaHref: "/categories/shampoo" }
  { id: 4, category: "fragrance", bannerImage: "/fragrance_banner.png", ctaHref: "/categories/fragrance" }
```
