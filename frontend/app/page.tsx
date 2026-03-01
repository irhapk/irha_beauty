import {
  CategoryGrid,
  FeaturedProducts,
  HeroCarousel,
  ReviewsCarousel,
  TopProduct,
} from "@/components/home";
import { FEATURED_PRODUCTS, STATIC_CATEGORIES } from "@/lib/static-data";

// Server Component — renders homepage sections with static curated data.
// Backend API (fetchProducts/fetchCategories) will be integrated once the
// backend schema includes slug, image, and status fields (Phase 6+).
export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <CategoryGrid categories={STATIC_CATEGORIES} />
      <FeaturedProducts products={FEATURED_PRODUCTS} />
      <TopProduct />
      <ReviewsCarousel />
    </main>
  );
}
