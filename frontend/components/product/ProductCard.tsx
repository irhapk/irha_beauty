"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

import { formatPrice, BLUR_DATA_URL } from "@/lib/utils";
import { useCartStore, useWishlistStore } from "@/store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const showPopup = useCartStore((s) => s.showPopup);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  function handleAddToCart(e: React.MouseEvent): void {
    e.preventDefault();
    addItem(product);
    showPopup(product);
  }

  function handleBuyNow(e: React.MouseEvent): void {
    e.preventDefault();
    addItem(product);
    router.push("/checkout");
  }

  function handleWishlist(e: React.MouseEvent): void {
    e.preventDefault();
    toggle(product);
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-100">
          {/* Primary image */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          {/* Hover image */}
          <Image
            src={product.hoverImage}
            alt={`${product.name} — alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Actions overlay — always visible on mobile, hover-revealed on sm+ */}
          <div className="absolute bottom-0 flex w-full transition-transform duration-300 ease-out sm:translate-y-full sm:group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black py-3.5 text-xs tracking-widest uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gold py-3.5 text-xs tracking-widest uppercase text-black transition-colors hover:bg-black hover:text-white"
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlist}
              aria-label={mounted && isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="border-l border-white/10 bg-black px-4 text-white transition-colors hover:bg-gold hover:text-black"
            >
              {mounted && isWishlisted ? (
                <FaHeart className="h-4 w-4 text-gold" />
              ) : (
                <FiHeart className="h-4 w-4" />
              )}
            </button>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-xs tracking-widest uppercase text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-heading text-lg font-light">{product.name}</h3>
          <p className="text-sm text-gold">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
