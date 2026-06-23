import type { Category, Product } from "@/types";

// Static homepage data — used until backend returns slug/image/status fields.
// Phase 6+ will integrate live API data once backend schema is extended.

export const STATIC_CATEGORIES: Category[] = [
  {
    id: 4,
    name: "Facewash",
    slug: "facewash",
    status: "active",
    bannerImage: "/facewash_banner.png",
    categoryImage: "/facewash_category.png",
  },
  {
    id: 1,
    name: "Shampoo",
    slug: "shampoo",
    status: "coming-soon",
    bannerImage: "/shampoo_banner.png",
    categoryImage: "/shampoo_category.png",
  },
  {
    id: 2,
    name: "Hair Oils",
    slug: "oils",
    status: "coming-soon",
    bannerImage: "/oil_banner.png",
    categoryImage: "/oil_category.png",
  },
  {
    id: 3,
    name: "Fragrance",
    slug: "fragrance",
    status: "coming-soon",
    bannerImage: "/fragrance_banner.png",
    categoryImage: "/fragrance_category.png",
  },
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Irha Oil Control Facewash",
    slug: "oil-control-facewash",
    description:
      "Advanced oil control facewash enriched with Vitamin E. Deeply cleanses pores, eliminates excess sebum, and keeps skin fresh and matte all day. Infused with natural botanical extracts for a gentle yet powerful cleanse that leaves skin balanced, smooth, and radiant.",
    price: 499,
    image: "/shampoo_one.png",
    hoverImage: "/shampoo_two.png",
    category: "facewash",
    inStock: true,
  },
];

export const COMING_SOON_PRODUCTS: Product[] = [
  // Shampoo category (slug: "shampoo")
  {
    id: 101,
    name: "Hydrating Shampoo",
    slug: "hydrating-shampoo",
    description: "Coming Soon",
    price: 0,
    image: "/shampoo_one.png",
    hoverImage: "/shampoo_two.png",
    category: "shampoo",
    inStock: false,
  },
  {
    id: 102,
    name: "Strengthening Shampoo",
    slug: "strengthening-shampoo",
    description: "Coming Soon",
    price: 0,
    image: "/shampoo_two.png",
    hoverImage: "/shampoo_one.png",
    category: "shampoo",
    inStock: false,
  },
  // Hair Oils category (slug: "oils")
  {
    id: 201,
    name: "Argan Hair Oil",
    slug: "argan-hair-oil",
    description: "Coming Soon",
    price: 0,
    image: "/oil_banner.png",
    hoverImage: "/oil_category.png",
    category: "oils",
    inStock: false,
  },
  {
    id: 202,
    name: "Coconut Growth Oil",
    slug: "coconut-growth-oil",
    description: "Coming Soon",
    price: 0,
    image: "/oil_category.png",
    hoverImage: "/oil_banner.png",
    category: "oils",
    inStock: false,
  },
  // Fragrance category (slug: "fragrance")
  {
    id: 301,
    name: "Rose Mist Perfume",
    slug: "rose-mist-perfume",
    description: "Coming Soon",
    price: 0,
    image: "/fragrance_banner.png",
    hoverImage: "/fragrance_category.png",
    category: "fragrance",
    inStock: false,
  },
  {
    id: 302,
    name: "Oud Collection",
    slug: "oud-collection",
    description: "Coming Soon",
    price: 0,
    image: "/fragrance_category.png",
    hoverImage: "/fragrance_banner.png",
    category: "fragrance",
    inStock: false,
  },
];
