# API Contracts: 004-nextjs-storefront

**Date**: 2026-02-28
**Base URL (via Next.js rewrite proxy)**: `/api`
**All requests**: `withCredentials: true` (Axios instance default)

---

## Existing Backend Endpoints (consumed by frontend)

### Auth

| Method | Path | Request Body | Response | Used by |
|--------|------|-------------|----------|---------|
| POST | `/api/v1/auth/register` | `{ full_name, email, password }` | `201 UserRead` + cookies | Register page |
| POST | `/api/v1/auth/login` | `{ email, password }` | `200 UserRead` + cookies | Login page |
| POST | `/api/v1/auth/logout` | — | `204` | Header logout button |
| GET | `/api/v1/auth/me` | — | `200 UserRead` | AuthProvider on mount |
| POST | `/api/v1/auth/refresh` | — | `200 UserRead` + new access cookie | Axios 401 interceptor |

### Products

| Method | Path | Query Params | Response | Used by |
|--------|------|-------------|----------|---------|
| GET | `/api/v1/products` | `?category=shampoo` | `200 Product[]` | Category page, homepage |
| GET | `/api/v1/products/{id}` | — | `200 Product` | Product detail page |

### Categories

| Method | Path | Response | Used by |
|--------|------|----------|---------|
| GET | `/api/v1/categories` | `200 Category[]` | Homepage category grid |
| GET | `/api/v1/categories/{id}` | `200 Category` | Category page |

---

## New Backend Endpoints (to be implemented as part of this feature)

### Orders

#### POST /api/v1/orders
Create a new COD order.

**Request** (authenticated or guest):
```json
{
  "customer_name": "Fatima Khan",
  "address": "House 12, Block B, Gulshan-e-Iqbal",
  "city": "Karachi",
  "phone": "03001234567",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 1800 }
  ],
  "payment_method": "cod",
  "total_amount": 3600
}
```

**Response `201`**:
```json
{
  "id": 42,
  "customer_name": "Fatima Khan",
  "address": "House 12, Block B, Gulshan-e-Iqbal",
  "city": "Karachi",
  "phone": "03001234567",
  "items": [{ "product_id": 1, "quantity": 2, "unit_price": 1800 }],
  "payment_method": "cod",
  "total_amount": 3600,
  "status": "pending",
  "created_at": "2026-02-28T10:00:00Z",
  "user_id": 5
}
```

**Errors**:
- `422` — validation error (missing required fields)
- `404` — product not found in items

**Auth**: Optional — if `access_token` cookie present, order is linked to the user. If not, `user_id` = null (guest order).

---

#### GET /api/v1/orders/my
Get all orders for the currently authenticated user.

**Auth**: Required — `401 NOT_AUTHENTICATED` if no valid cookie.

**Response `200`**:
```json
[
  {
    "id": 42,
    "total_amount": 3600,
    "status": "pending",
    "created_at": "2026-02-28T10:00:00Z",
    "items": [{ "product_id": 1, "quantity": 2, "unit_price": 1800 }]
  }
]
```

---

## Frontend API Module (`lib/api.ts`) — Function Signatures

```ts
// Auth
fetchCurrentUser(): Promise<User>
registerUser(data: RegisterRequest): Promise<User>
loginUser(data: LoginRequest): Promise<User>
logoutUser(): Promise<void>

// Products
fetchProducts(category?: string): Promise<Product[]>
fetchProduct(id: number): Promise<Product>

// Categories
fetchCategories(): Promise<Category[]>

// Orders
createOrder(payload: CreateOrderPayload): Promise<Order>
fetchMyOrders(): Promise<Order[]>
```

---

## Axios Instance Config (`lib/api.ts`)

```ts
const api = axios.create({
  baseURL: '/api',           // proxied via next.config.ts rewrites
  withCredentials: true,     // send/receive httpOnly cookies
  headers: { 'Content-Type': 'application/json' }
})

// 401 interceptor: attempt token refresh, retry once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      await api.post('/v1/auth/refresh')
      return api(error.config)
    }
    return Promise.reject(error)
  }
)
```

---

## Next.js Rewrite Config (`next.config.ts`)

```ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
    }
  ]
}
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Error Handling Contract

All API errors follow the backend envelope:
```json
{ "detail": "human-readable message", "code": "SCREAMING_SNAKE_ERROR_CODE" }
```

Frontend maps error codes to user-facing messages:
| Code | User message |
|------|-------------|
| `EMAIL_ALREADY_EXISTS` | "This email is already registered." |
| `INVALID_CREDENTIALS` | "Invalid email or password." |
| `NOT_AUTHENTICATED` | Redirect to `/login` |
| `TOKEN_EXPIRED` | Auto-refresh via interceptor |
| `NOT_FOUND` | "This item no longer exists." |
