"use client";

import Image from "next/image";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";

import { FadeIn } from "@/components/animations";
import { formatPrice, BLUR_DATA_URL } from "@/lib/utils";
import { useCartStore, useWishlistStore } from "@/store";

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <FadeIn className="space-y-6">
          <FiHeart className="mx-auto h-16 w-16 text-gray-200" />
          <div>
            <h1 className="font-heading text-3xl font-light">
              Your wishlist is empty
            </h1>
            <p className="mt-2 text-sm text-gray-mid">
              Save items you love and find them here anytime.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block rounded-full bg-black px-8 py-3 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold"
          >
            Browse Products
          </Link>
        </FadeIn>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-10">
          <h1 className="font-heading text-4xl font-light">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-mid">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </FadeIn>

        <AnimatePresence initial={false}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="group rounded-sm border border-gray-100 p-4"
              >
                {/* Thumbnail */}
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="mt-3 space-y-1">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-heading text-base font-light transition-colors hover:text-gold">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gold">{formatPrice(product.price)}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => addItem(product)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-black py-2.5 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold hover:text-black"
                  >
                    <FiShoppingBag className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(product.id)}
                    aria-label="Remove from wishlist"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-gray-200 text-gray-light transition-colors hover:border-red-300 hover:text-red-400"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <div className="mt-10">
          <Link
            href="/products"
            className="text-xs tracking-widest uppercase text-gray-mid transition-colors hover:text-gold"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
