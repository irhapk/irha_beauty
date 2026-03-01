export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  hoverImage: string;
  category: string;
  inStock: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  status: "active" | "coming-soon";
  bannerImage: string;
  categoryImage: string;
}

export interface CartItem {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface OrderItemIn {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderItemRead {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderPayload {
  customer_name: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  items: OrderItemIn[];
  payment_method: "cod";
  total_amount: number;
}

export interface Order {
  id: number;
  customer_name: string;
  email: string;
  address: string;
  city: string;
  phone: string;
  items: OrderItemRead[];
  payment_method: string;
  total_amount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  created_at: string;
  user_id: number | null;
}

export interface Slide {
  id: number;
  category: string;
  bannerImage: string;
  subtitle: string;
  headline: string;
  body: string;
  ctaHref: string;
}

export interface ApiError {
  detail: string;
  code: string;
}
