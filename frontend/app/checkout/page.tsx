"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { FiCheckCircle, FiShoppingBag } from "react-icons/fi";

import { FadeIn } from "@/components/animations";
import { CheckoutForm } from "@/components/checkout";
import { formatPrice, BLUR_DATA_URL, DELIVERY_CHARGE } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store";

export default function CheckoutPage(): React.ReactElement {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const total = useCartTotal();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.replace("/cart");
    }
  }, [items.length, orderPlaced, router]);

  if (items.length === 0 && !orderPlaced) return <></>;

  if (orderPlaced) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center text-center"
        >
          {/* Animated gold ring + check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/5"
          >
            <FiCheckCircle className="h-12 w-12 text-gold" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="space-y-3"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Order Confirmed
            </p>
            <h2 className="font-heading text-4xl font-light">Thank You!</h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-mid">
              Your order has been placed successfully. Our team will confirm
              your delivery soon.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="my-8 h-px w-24 origin-left bg-gold/30"
          />

          {/* Amount payable */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mb-8 rounded-sm border border-gray-100 bg-gray-50 px-8 py-4 text-center"
          >
            <p className="text-xs uppercase tracking-widest text-gray-mid">
              Amount Payable on Delivery
            </p>
            <p className="mt-1 font-heading text-3xl font-light text-gold">
              {formatPrice(grandTotal)}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-sm bg-black px-8 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:bg-gold"
            >
              <FiShoppingBag className="h-4 w-4" />
              Track My Order
            </Link>
            <Link
              href="/products"
              className="text-xs uppercase tracking-widest text-gray-mid transition-colors hover:text-gold"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-10">
          <h1 className="font-heading text-4xl font-light">Checkout</h1>
          <p className="mt-1 text-sm text-gray-mid">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Checkout form */}
          <FadeIn className="lg:col-span-2">
            <CheckoutForm
              onSuccess={(total) => {
                setGrandTotal(total);
                setOrderPlaced(true);
              }}
            />
          </FadeIn>

          {/* Order summary */}
          <FadeIn delay={0.2} className="lg:col-span-1">
            <div className="rounded-sm border border-gray-100 p-6">
              <h2 className="mb-6 font-heading text-2xl font-light">
                Order Summary
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-gray-50">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-light">{item.name}</p>
                        <p className="text-xs text-gray-mid">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-gold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-gray-100" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-mid">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-mid">
                  <span>Delivery</span>
                  <span>{formatPrice(DELIVERY_CHARGE)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-medium">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(total + DELIVERY_CHARGE)}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
