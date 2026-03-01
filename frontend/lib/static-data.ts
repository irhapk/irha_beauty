import type { Category, Product } from "@/types";

// Static homepage data — used until backend returns slug/image/status fields.
// Phase 6+ will integrate live API data once backend schema is extended.

export const STATIC_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Shampoo",
    slug: "shampoo",
    status: "active",
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
    name: "Irha's Oil Control Facewash",
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
