"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import { FadeIn, ScrollReveal, scrollItemVariants } from "@/components/animations";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-[1470px] px-6">
        {/* Heading */}
        <FadeIn className="mb-12 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
            Curated for You
          </p>
          <h2 className="font-heading text-4xl font-light md:text-5xl">
            Featured Products
          </h2>
          {/* Gold underline accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mx-auto mt-4 h-px w-16 origin-left bg-gold"
          />
        </FadeIn>

        {/* Product grid */}
        <ScrollReveal className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <motion.div key={product.id} variants={scrollItemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </ScrollReveal>

        {/* View All */}
        <div className="mt-14 text-center">
          <Link
            href="/products"
            className="inline-block rounded-full border border-dark-brown px-10 py-3 text-xs tracking-widest uppercase text-dark-brown transition-all hover:bg-dark-brown hover:text-white"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
