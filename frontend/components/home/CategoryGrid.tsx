"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

import { ScrollReveal, scrollItemVariants } from "@/components/animations";
import { BLUR_DATA_URL } from "@/lib/utils";
import type { Category } from "@/types";

const STATUS_LABEL: Record<Category["status"], string | null> = {
  active: null,
  "coming-soon": "Coming Soon",
};

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="mx-auto max-w-[1470px] px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs tracking-[0.3em] uppercase text-gold">
          Explore
        </p>
        <h2 className="font-heading text-4xl font-light md:text-5xl">
          Shop by Category
        </h2>
      </div>

      <ScrollReveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const label = STATUS_LABEL[cat.status];

          return (
            <motion.div
              key={cat.id}
              variants={scrollItemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/categories/${cat.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-sm">
                  <Image
                    src={cat.categoryImage}
                    alt={cat.name}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className={`object-cover transition-transform duration-700 group-hover:scale-105 ${cat.status === "coming-soon" ? "brightness-75" : ""}`}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/50" />

                  {/* Category name */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <h3 className="font-heading text-2xl font-light text-white drop-shadow-lg md:text-3xl">
                      {cat.name}
                    </h3>
                    {label && (
                      <span className="rounded-full border border-gold/70 px-4 py-1 text-xs tracking-widest uppercase text-gold">
                        {label}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </ScrollReveal>
    </section>
  );
}
