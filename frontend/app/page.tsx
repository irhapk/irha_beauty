import {
  CategoryGrid,
  FeaturedProducts,
  HeroCarousel,
  ReviewsCarousel,
  TopProduct,
} from "@/components/home";
import {
  enrichCategories,
  enrichProducts,
  type BackendCategory,
  type BackendProduct,
} from "@/lib/product-mapper";
import { FEATURED_PRODUCTS, STATIC_CATEGORIES } from "@/lib/static-data";

async function getLiveCategories() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${base}/api/v1/categories`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data: BackendCategory[] = await res.json();
      const enriched = enrichCategories(data);
      if (enriched.length > 0) return enriched;
    }
  } catch {}
  return STATIC_CATEGORIES;
}

async function getLiveProducts() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${base}/api/v1/products`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data: BackendProduct[] = await res.json();
      const enriched = enrichProducts(data);
      if (enriched.length > 0) return enriched;
    }
  } catch {}
  return FEATURED_PRODUCTS;
}

export default async function Home() {
  const [categories, products] = await Promise.all([
    getLiveCategories(),
    getLiveProducts(),
  ]);

  return (
    <main>
      <HeroCarousel />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={products} />
      <TopProduct />
      <ReviewsCarousel />
    </main>
  );
}
