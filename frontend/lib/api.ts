import axios from "axios";

import type {
  ApiError,
  Category,
  CreateOrderPayload,
  Order,
  Product,
  User,
} from "@/types";

// Augment Axios config type to support _retry flag
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 401 interceptor: attempt token refresh, retry original request once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !original.url?.includes("refresh")) {
      original._retry = true;
      try {
        await api.post("/v1/auth/refresh");
        return api(original);
      } catch {
        // Refresh failed — propagate original 401
      }
    }

    const apiError: ApiError = {
      detail: error.response?.data?.detail ?? "An unexpected error occurred.",
      code: error.response?.data?.code ?? "UNKNOWN_ERROR",
    };
    return Promise.reject(apiError);
  },
);

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
}): Promise<void> {
  await api.post("/v1/auth/register", payload);
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<void> {
  await api.post("/v1/auth/login", payload);
}

export async function logoutUser(): Promise<void> {
  await api.post("/v1/auth/logout");
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/v1/auth/me");
  return data;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function fetchProducts(category?: string): Promise<Product[]> {
  const params = category ? { category } : {};
  const { data } = await api.get<Product[]>("/v1/products", { params });
  return data;
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/v1/products/${id}`);
  return data;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/v1/categories");
  return data;
}

export async function fetchCategory(slug: string): Promise<Category> {
  const { data } = await api.get<Category>(`/v1/categories/${slug}`);
  return data;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<Order>("/v1/orders", payload);
  return data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/v1/orders/my");
  return data;
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/v1/orders/all");
  return data;
}

export async function updateOrderStatus(
  orderId: number,
  status: Order["status"],
): Promise<Order> {
  const { data } = await api.patch<Order>(`/v1/orders/${orderId}/status`, { status });
  return data;
}
