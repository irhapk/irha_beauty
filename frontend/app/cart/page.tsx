"use client";

import Image from "next/image";
import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from "react-icons/fi";

import { FadeIn } from "@/components/animations";
import { formatPrice, BLUR_DATA_URL, DELIVERY_CHARGE } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store";

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const total = useCartTotal();

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <FadeIn className="space-y-6">
          <FiShoppingBag className="mx-auto h-16 w-16 text-gray-200" />
          <div>
            <h1 className="font-heading text-3xl font-light">
              Your cart is empty
            </h1>
            <p className="mt-2 text-sm text-gray-mid">
              Looks like you haven&apos;t added anything yet.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block rounded-full bg-black px-8 py-3 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold"
          >
            Continue Shopping
          </Link>
        </FadeIn>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-10">
          <h1 className="font-heading text-4xl font-light">Shopping Cart</h1>
          <p className="mt-1 text-sm text-gray-mid">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Item list */}
          <div className="lg:col-span-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 border-b border-gray-100 py-5 sm:gap-5 sm:py-6">
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.productId}`}
                      className="shrink-0"
                    >
                      <div className="relative h-28 w-20 overflow-hidden rounded-sm bg-gray-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="font-heading text-lg font-light transition-colors hover:text-gold">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="mt-0.5 text-sm text-gray-mid">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          aria-label="Remove item"
                          className="flex h-11 w-11 items-center justify-center text-gray-light transition-colors hover:text-red-400"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Qty selector */}
                        <div className="flex items-center border border-gray-200">
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() =>
                              updateQty(item.productId, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="p-2.5 transition-colors hover:bg-gray-50"
                          >
                            <FiMinus className="h-3 w-3" />
                          </motion.button>
                          <span className="w-10 text-center text-sm">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() =>
                              updateQty(item.productId, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="p-2.5 transition-colors hover:bg-gray-50"
                          >
                            <FiPlus className="h-3 w-3" />
                          </motion.button>
                        </div>

                        {/* Line total */}
                        <p className="text-sm font-medium text-gold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-6">
              <Link
                href="/products"
                className="text-xs tracking-widest uppercase text-gray-mid transition-colors hover:text-gold"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <FadeIn
              delay={0.2}
              className="rounded-sm border border-gray-100 p-6"
            >
              <h2 className="mb-6 font-heading text-2xl font-light">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-mid">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-mid">Delivery</span>
                  <span>{formatPrice(DELIVERY_CHARGE)}</span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-100" />

              <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span className="text-gold">{formatPrice(total + DELIVERY_CHARGE)}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-sm bg-black py-4 text-center text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold"
              >
                Proceed to Checkout
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </main>
  );
}
