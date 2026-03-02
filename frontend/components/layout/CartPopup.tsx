"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiX, FiShoppingBag } from "react-icons/fi";
import { useCartStore } from "@/store";

export function CartPopup() {
  const popupOpen = useCartStore((s) => s.popupOpen);
  const popupProduct = useCartStore((s) => s.popupProduct);
  const hidePopup = useCartStore((s) => s.hidePopup);

  useEffect(() => {
    if (!popupOpen) return;
    const timer = setTimeout(hidePopup, 3000);
    return () => clearTimeout(timer);
  }, [popupOpen, hidePopup]);

  return (
    <AnimatePresence>
      {popupOpen && popupProduct && (
        <motion.div
          key="cart-popup"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed top-[140px] right-4 z-[60] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-gold/30 bg-black shadow-2xl"
        >
          {/* Gold accent bar */}
          <div className="h-0.5 w-full bg-gold" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Checkmark */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                <FiCheck className="h-4 w-4 text-gold" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  Added to Cart
                </p>
                <p className="mt-0.5 truncate text-sm text-white">
                  {popupProduct.name}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={hidePopup}
                aria-label="Dismiss"
                className="shrink-0 text-gray-light transition-colors hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
              <Link
                href="/cart"
                onClick={hidePopup}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-white/20 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:border-gold hover:text-gold"
              >
                <FiShoppingBag className="h-3 w-3" />
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={hidePopup}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-gold py-2 text-xs uppercase tracking-widest text-black transition-colors hover:bg-gold/80"
              >
                Checkout →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
