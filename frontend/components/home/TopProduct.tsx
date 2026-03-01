"use client";

import Image from "next/image";

import { motion } from "framer-motion";
import { FiShoppingBag } from "react-icons/fi";

import { scrollItemVariants, ScrollReveal } from "@/components/animations";
import { formatPrice, BLUR_DATA_URL } from "@/lib/utils";
import { FEATURED_PRODUCTS } from "@/lib/static-data";
import { useCartStore } from "@/store";

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const INGREDIENT_TAGS = [
  "Oil Control",
  "Vitamin E",
  "Botanical Extracts",
  "Deep Cleanse",
  "Matte Finish",
  "Anti-Sebum",
  "Pore Tightening",
  "Skin Balancing",
];

const BENEFITS = [
  { label: "Controls excess oil", detail: "Regulates sebum production for a long-lasting matte complexion." },
  { label: "Vitamin E enriched", detail: "Nourishes and protects the skin barrier while cleansing." },
  { label: "Deep pore cleanse", detail: "Removes dirt, impurities and makeup residue without stripping." },
  { label: "Botanical extracts", detail: "Natural plant actives calm inflammation and even skin tone." },
];

export function TopProduct() {
  const product = FEATURED_PRODUCTS[0];
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-[1470px] px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-16 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            Best Seller
          </p>
          <h2 className="mt-3 font-heading text-4xl font-light">
            Top Product
          </h2>
        </motion.div>

        <ScrollReveal className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            variants={scrollItemVariants}
            className="relative mx-auto w-full max-w-md pb-6 pr-6 sm:pb-0 sm:pr-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#f8f6f3]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain p-4 transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.4, ease: EASE_OUT }}
              className="absolute -bottom-4 -right-4 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-gold text-black shadow-lg"
            >
              <span className="text-xs font-bold uppercase leading-tight tracking-wide">
                Best
              </span>
              <span className="text-xs font-bold uppercase leading-tight tracking-wide">
                Seller
              </span>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div variants={scrollItemVariants} className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold">
                Oil Control · Vitamin E
              </p>
              <h3 className="mt-2 font-heading text-3xl font-light lg:text-4xl">
                {product.name}
              </h3>
              <p className="mt-1 font-heading text-2xl text-gold">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="leading-relaxed text-gray-mid">
              {product.description}
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {BENEFITS.map((benefit) => (
                <div key={benefit.label} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="text-sm font-medium">{benefit.label}</p>
                    <p className="text-xs text-gray-mid">{benefit.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ingredient tags */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-gray-mid">
                Key Ingredients
              </p>
              <div className="flex flex-wrap gap-2">
                {INGREDIENT_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs text-gold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => addItem(product)}
              className="inline-flex items-center gap-3 rounded-sm bg-black px-8 py-4 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold hover:text-black"
            >
              <FiShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
