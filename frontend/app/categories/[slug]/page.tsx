import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { FadeIn } from "@/components/animations";
import { ComingSoon } from "@/components/product/ComingSoon";
import { ProductGrid } from "@/components/product/ProductGrid";
import { enrichProducts, type BackendProduct } from "@/lib/product-mapper";
import { BLUR_DATA_URL } from "@/lib/utils";
import { FEATURED_PRODUCTS, STATIC_CATEGORIES } from "@/lib/static-data";
import type { Product } from "@/types";

export function generateStaticParams() {
  return STATIC_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = STATIC_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category" };
  return {
    title: category.name,
    description: `Shop our ${category.name} collection — luxury hair care products crafted with the finest ingredients.`,
  };
}

async function getProductsByCategory(slug: string): Promise<Product[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    const res = await fetch(`${base}/api/v1/products`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data: BackendProduct[] = await res.json();
      const filtered = enrichProducts(data).filter((p) => p.category === slug);
      if (filtered.length > 0) return filtered;
    }
  } catch {}
  return FEATURED_PRODUCTS.filter((p) => p.category === slug);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = STATIC_CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  if (category.status === "coming-soon") {
    return <ComingSoon category={category} />;
  }

  const products = await getProductsByCategory(slug);

  return (
    <main className="pt-20">
      {/* Banner */}
      <div className="relative h-64 overflow-hidden md:h-80">
        <Image
          src={category.bannerImage}
          alt={category.name}
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-end bg-black/50 px-8 pb-8">
          <div>
            <nav className="mb-2 flex gap-2 text-xs text-white/60">
              <Link href="/" className="transition-colors hover:text-gold">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">{category.name}</span>
            </nav>
            <h1 className="font-heading text-4xl font-light text-white md:text-5xl">
              {category.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <section className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-10">
          <p className="text-sm text-gray-mid">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </FadeIn>
        <ProductGrid products={products} columns={3} />
      </section>
    </main>
  );
}
