"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import { FiMinus, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

import { FadeIn } from "@/components/animations";
import { formatPrice, BLUR_DATA_URL } from "@/lib/utils";
import { useCartStore } from "@/store";
import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState<"primary" | "hover">("primary");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart(): void {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const imageSrc = activeImage === "primary" ? product.image : product.hoverImage;

  return (
    <section className="mx-auto max-w-[1470px] px-6 py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

        {/* Left — Image switcher */}
        <FadeIn direction="left">
          <div className="space-y-4">
            <div
              className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-sm bg-gray-50"
              onMouseEnter={() => setActiveImage("hover")}
              onMouseLeave={() => setActiveImage("primary")}
              onClick={() =>
                setActiveImage((a) => (a === "primary" ? "hover" : "primary"))
              }
            >
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover transition-opacity duration-500"
              />
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3">
              {([product.image, product.hoverImage] as const).map((src, i) => {
                const imgId = i === 0 ? "primary" : "hover";
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgId as "primary" | "hover")}
                    className={`relative h-20 w-16 overflow-hidden rounded-sm border-2 transition-colors ${
                      activeImage === imgId ? "border-gold" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      sizes="64px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Right — Product info */}
        <FadeIn direction="right">
          <div className="space-y-6">
            <Link
              href={`/categories/${product.category}`}
              className="text-xs tracking-[0.2em] uppercase text-gold transition-opacity hover:opacity-70"
            >
              {product.category}
            </Link>

            <h1 className="font-heading text-4xl font-light md:text-5xl">
              {product.name}
            </h1>

            <p className="text-2xl text-gold">{formatPrice(product.price)}</p>

            <p className="text-sm leading-relaxed text-gray-mid">
              {product.description}
            </p>

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.inStock ? "bg-green-500" : "bg-red-400"
                }`}
              />
              <span className="text-xs text-gray-mid">
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 transition-colors hover:bg-gray-50"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="p-3 transition-colors hover:bg-gray-50"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3.5 text-xs tracking-widest uppercase text-white transition-colors disabled:opacity-40 ${
                  added ? "bg-gold" : "bg-black hover:bg-gold"
                }`}
              >
                {added ? "Added ✓" : "Add to Cart"}
              </motion.button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
              <span className="text-xs text-gray-mid">Share:</span>
              <a
                href="https://wa.me/923220835045"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="text-gray-mid transition-colors hover:text-gold"
              >
                <FaWhatsapp className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Share on Facebook"
                className="text-gray-mid transition-colors hover:text-gold"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
