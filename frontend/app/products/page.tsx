import Link from "next/link";

import { FadeIn } from "@/components/animations";
import { ProductGrid } from "@/components/product/ProductGrid";
import { enrichProducts, type BackendProduct } from "@/lib/product-mapper";
import { FEATURED_PRODUCTS } from "@/lib/static-data";
import type { Product } from "@/types";

async function getAllProducts(): Promise<Product[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${base}/api/v1/products`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data: BackendProduct[] = await res.json();
      const enriched = enrichProducts(data);
      if (enriched.length > 0) return enriched;
    }
  } catch {}
  return FEATURED_PRODUCTS;
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-12">
          <nav className="mb-4 flex gap-2 text-xs text-gray-mid">
            <Link href="/" className="transition-colors hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span>All Products</span>
          </nav>
          <h1 className="font-heading text-4xl font-light md:text-5xl">
            All Products
          </h1>
          <p className="mt-2 text-sm text-gray-mid">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        </FadeIn>

        <ProductGrid products={products} columns={4} />
      </div>
    </main>
  );
}
