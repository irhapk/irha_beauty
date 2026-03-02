"use client";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";

import { useWishlistCount } from "@/store";

export function WishlistIcon() {
  const count = useWishlistCount();

  return (
    <Link
      href="/wishlist"
      className="relative flex h-11 w-11 items-center justify-center"
      aria-label={`Wishlist${count > 0 ? `, ${count} items` : ""}`}
    >
      <FiHeart className="h-6 w-6 text-black transition-colors hover:text-gold" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-semibold text-black"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
