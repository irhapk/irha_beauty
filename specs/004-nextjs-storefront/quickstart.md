# Quickstart: 004-nextjs-storefront

**Date**: 2026-02-28
**Prerequisite**: FastAPI backend running on `http://localhost:8000`

---

## Setup

```bash
# 1. Initialize Next.js app (from repo root)
cd frontend/
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"

# 2. Install dependencies
npm install framer-motion zustand axios react-icons
npx shadcn@latest init

# 3. Install shadcn components used in this project
npx shadcn@latest add button input label dialog sheet

# 4. Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 5. Start dev server
npm run dev   # → http://localhost:3000
```

---

## Scenario 1 — Homepage loads with animated hero

```
GET http://localhost:3000/
```

**Expected**:
- Hero carousel renders with first banner (e.g. banner-shampoo.jpg)
- Subtitle animates up at 200ms, headline at 500ms, body at 1200ms, CTA button at 1700ms
- "Discover Now" button pulses into view
- Carousel auto-advances to next slide every 4 seconds
- Scrolling down reveals Categories section with staggered card entrance animations

---

## Scenario 2 — Browse Shampoo category

```
GET http://localhost:3000/categories/shampoo
```

**Expected**:
- Product grid renders with shampoo product card
- Hovering card: shampoo.jpg fades to shampoo-hover.jpg (CSS opacity transition)
- Card lifts (y: -8px) on hover
- "Add to Cart" button slides up from card bottom on hover

---

## Scenario 3 — Browse Oils / Fragrance (coming soon)

```
GET http://localhost:3000/categories/oils
GET http://localhost:3000/categories/fragrance
```

**Expected**:
- Beautiful animated "Coming Soon" page — not a blank screen
- Clear CTA to return to homepage or browse Shampoo

---

## Scenario 4 — Add to cart and place COD order

```
1. Click "Add to Cart" on product detail page
2. Cart icon badge updates to (1)
3. Navigate to /cart → see item, quantity, total
4. Update quantity → total recalculates instantly
5. Click "Proceed to Checkout"
6. Fill: Full Name, Address, City, Phone
7. Select "Cash on Delivery" (only option shown)
8. Click "Place Order"
```

**Expected POST** to `/api/v1/orders`:
```json
{
  "customer_name": "Fatima Khan",
  "address": "House 12, Block B, Gulshan-e-Iqbal",
  "city": "Karachi",
  "phone": "03001234567",
  "items": [{ "product_id": 1, "quantity": 1, "unit_price": 1800 }],
  "payment_method": "cod",
  "total_amount": 1800
}
```

**Expected**: `201` response → Order confirmation screen with summary. Cart cleared.

---

## Scenario 5 — Register and auto-login

```
Navigate to: http://localhost:3000/register
Fill: Full Name = "Aisha", Email = "aisha@test.com", Password = "pass1234"
Click "Create Account"
```

**Expected**:
- POST /api/v1/auth/register called
- Redirected to homepage
- Header shows "Aisha"
- Short password (< 8 chars) → inline error before submission

---

## Scenario 6 — Login

```
Navigate to: http://localhost:3000/login
Fill: Email = "aisha@test.com", Password = "pass1234"
Click "Sign In"
```

**Expected**:
- POST /api/v1/auth/login called
- Redirected to homepage, header shows user name
- Wrong password → "Invalid email or password" shown inline

---

## Scenario 7 — View order history (authenticated)

```
Navigate to: http://localhost:3000/orders (logged in)
```

**Expected**:
- GET /api/v1/orders/my called
- List of past orders with: date, product name, quantity, total (PKR), status badge

```
Navigate to: http://localhost:3000/orders (not logged in)
```

**Expected**: Redirect to /login

---

## Scenario 8 — Cart persists after browser refresh

```
1. Add product to cart
2. Hard-refresh page (Ctrl+F5)
```

**Expected**:
- Cart badge still shows item count
- /cart still shows the added items
- localStorage key `irha-cart` contains serialised cart state

---

## Scenario 9 — Page transition animations

```
Click: Home → /categories/shampoo → /products/1 → /cart
```

**Expected**:
- Each route change: current page fades + slides up (exit), new page fades + slides in (enter)
- Smooth 300ms AnimatePresence transition — no hard cuts
2. FastAPI backend running at `http://localhost:8000`

