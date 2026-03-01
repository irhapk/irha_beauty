import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductDetail } from "@/components/product/ProductDetail";
import { enrichProduct, type BackendProduct } from "@/lib/product-mapper";
import { FEATURED_PRODUCTS } from "@/lib/static-data";
import type { Product } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getProduct(id: number): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/products/${id}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return FEATURED_PRODUCTS.find((p) => p.id === id) ?? null;
    const data: BackendProduct = await res.json();
    return enrichProduct(data);
  } catch {
    return FEATURED_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return { title: "Product | Irha Beauty" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) notFound();

  return (
    <main className="pt-20">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1470px] px-6 pt-6">
        <nav className="flex gap-2 text-xs text-gray-mid">
          <Link href="/" className="transition-colors hover:text-gold">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="transition-colors hover:text-gold">
            Products
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
      </div>

      <ProductDetail product={product} />
    </main>
  );
}
