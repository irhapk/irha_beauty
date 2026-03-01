"use client";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import { FiShoppingBag } from "react-icons/fi";

import { useCartCount } from "@/store";

export function CartIcon() {
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      className="relative flex h-11 w-11 items-center justify-center"
      aria-label={`Shopping cart${count > 0 ? `, ${count} items` : ""}`}
    >
      <FiShoppingBag className="h-6 w-6 text-white" />
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
