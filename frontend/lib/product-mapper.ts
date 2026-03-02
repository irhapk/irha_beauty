import type { Category, Product } from "@/types";
import { FEATURED_PRODUCTS, STATIC_CATEGORIES } from "./static-data";

// ── Backend API shapes ─────────────────────────────────────────────────────

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  status: string;
  banner_image: string;
  category_image: string;
  description: string;
  created_at: string;
}

export interface BackendProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image: string;
  hover_image: string;
  created_at: string;
}

// ── Mappers ────────────────────────────────────────────────────────────────

// NeonDB insertion-order mapping — fallback when category slug not on product
const CATEGORY_SLUG_MAP: Record<number, string> = {
  1: "shampoo",
  2: "oils",
  3: "fragrance",
  4: "facewash",
};

export function enrichCategory(bc: BackendCategory): Category {
  const staticMatch = STATIC_CATEGORIES.find((c) => c.id === bc.id);
  return {
    id: bc.id,
    name: bc.name,
    slug: bc.slug || staticMatch?.slug || bc.name.toLowerCase().replace(/\s+/g, "-"),
    status: (bc.status as Category["status"]) || staticMatch?.status || "active",
    bannerImage: bc.banner_image || staticMatch?.bannerImage || "",
    categoryImage: bc.category_image || staticMatch?.categoryImage || "",
  };
}

export function enrichCategories(bcs: BackendCategory[]): Category[] {
  return bcs.map(enrichCategory);
}

export function enrichProduct(bp: BackendProduct): Product {
  const staticMatch = FEATURED_PRODUCTS.find((p) => p.id === bp.id);
  const slug =
    bp.slug ||
    staticMatch?.slug ||
    bp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return {
    id: bp.id,
    name: bp.name,
    slug,
    description: bp.description,
    price: bp.price,
    image: bp.image || staticMatch?.image || "/shampoo_one.png",
    hoverImage: bp.hover_image || staticMatch?.hoverImage || "/shampoo_two.png",
    category:
      staticMatch?.category ?? (CATEGORY_SLUG_MAP[bp.category_id] ?? "shampoo"),
    inStock: bp.stock > 0,
  };
}

export function enrichProducts(bps: BackendProduct[]): Product[] {
  return bps.map(enrichProduct);
}
