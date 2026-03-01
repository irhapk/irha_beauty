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
  price: number           // PKR, integer (e.g. 1800)
  image: string           // filename: "shampoo.jpg"
  hoverImage: string      // filename: "shampoo-hover.jpg"
  category: string        // "shampoo" | "oils" | "fragrance"
  inStock: boolean
}
```

### Category
```ts
interface Category {
  id: number
  name: string
  slug: string            // "shampoo" | "oils" | "fragrance"
  status: "active" | "coming-soon"
  bannerImage: string     // "banner-shampoo.jpg"
  categoryImage: string   // "category-shampoo.jpg"
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

interface CreateOrderPayload {
  customer_name: string
  address: string
  city: string
  phone: string
  items: OrderItem[]
  payment_method: "cod"
  total_amount: number
}

interface Order {
  id: number
  customer_name: string
  address: string
  city: string
  phone: string
  items: OrderItem[]
  payment_method: string
  total_amount: number
  status: "pending" | "processing" | "delivered" | "cancelled"
  created_at: string
  user_id: number | null  // null for guest orders
}
```

### Slide (Hero Carousel)
```ts
interface Slide {
  id: number
  category: string           // "oils" | "shampoo" | "fragrance"
  bannerImage: string        // "banner-oils.jpg"
  subtitle: string           // "QUALITY YOU CAN FEEL"
  headline: string           // "Pure Oils, Pure Luxury"
  body: string               // Supporting copy
  ctaLabel: string           // "Discover Now"
  ctaHref: string            // "/categories/oils"
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

**Alembic migration**: `add_orders_and_order_items`

---

## Static Data (hardcoded in frontend for Phase 4)

Products and categories are fetched from the FastAPI backend at `/api/v1/products` and `/api/v1/categories`. No static JSON files — always fetched from API.

### Seed data (already in NeonDB or to be seeded):
```
Category: { name: "Shampoo",   slug: "shampoo",   status: "active" }
Category: { name: "Oils",      slug: "oils",       status: "coming-soon" }
Category: { name: "Fragrance", slug: "fragrance",  status: "coming-soon" }

Product: {
  name: "Irha Argan Shampoo",
  price: 1800,
  category: "shampoo",
  description: "Nourish and revitalise your hair with our premium Argan Oil Shampoo...",
  image: "shampoo.jpg",
  hoverImage: "shampoo-hover.jpg"
}
```
