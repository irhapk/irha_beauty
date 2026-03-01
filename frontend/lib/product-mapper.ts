import type { Product } from "@/types";
import { FEATURED_PRODUCTS } from "./static-data";

export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  created_at: string;
}

// NeonDB insertion-order mapping — adjust if categories were created differently
const CATEGORY_SLUG_MAP: Record<number, string> = {
  1: "shampoo",
  2: "oils",
  3: "fragrance",
};

export function enrichProduct(bp: BackendProduct): Product {
  const staticMatch = FEATURED_PRODUCTS.find((p) => p.id === bp.id);
  const slug = bp.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id: bp.id,
    name: bp.name,
    slug: staticMatch?.slug ?? slug,
    description: bp.description,
    price: bp.price,
    image: staticMatch?.image ?? "/shampoo_one.png",
    hoverImage: staticMatch?.hoverImage ?? "/shampoo_two.png",
    category:
      staticMatch?.category ?? (CATEGORY_SLUG_MAP[bp.category_id] ?? "shampoo"),
    inStock: bp.stock > 0,
  };
}

export function enrichProducts(bps: BackendProduct[]): Product[] {
  return bps.map(enrichProduct);
}
