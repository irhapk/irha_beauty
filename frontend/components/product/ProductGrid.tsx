"use client";

import { motion } from "framer-motion";

import { ScrollReveal, scrollItemVariants } from "@/components/animations";
import type { Product } from "@/types";

import { ProductCard } from "./ProductCard";

const GRID_COLS: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-mid">No products available yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <ScrollReveal className={`grid gap-8 ${GRID_COLS[columns]}`}>
      {products.map((product) => (
        <motion.div key={product.id} variants={scrollItemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </ScrollReveal>
  );
}
