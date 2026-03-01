"use client";

import { Suspense, useEffect, useState } from "react";

import { motion } from "framer-motion";
import { FiCheckCircle, FiPackage } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

import { FadeIn, ScrollReveal, scrollItemVariants } from "@/components/animations";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMyOrders } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store";
import type { Order } from "@/types";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

function OrdersSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="space-y-3 rounded-sm border border-gray-100 p-6">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

function OrdersContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed") === "true";
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError("Failed to load orders. Please try again."))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) return <></>;

  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        {/* Success banner */}
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mb-8 flex items-center gap-3 rounded-sm border border-green-200 bg-green-50 px-6 py-4 text-green-700"
          >
            <FiCheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Your order has been placed! We&apos;ll be in touch soon.
            </p>
          </motion.div>
        )}

        <FadeIn className="mb-10">
          <h1 className="font-heading text-4xl font-light">My Orders</h1>
          {!isLoading && !error && (
            <p className="mt-1 text-sm text-gray-mid">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          )}
        </FadeIn>

        {isLoading ? (
          <OrdersSkeleton />
        ) : error ? (
          <FadeIn>
            <p className="text-sm text-red-500">{error}</p>
          </FadeIn>
        ) : orders.length === 0 ? (
          <FadeIn className="flex flex-col items-center justify-center space-y-4 py-24 text-center">
            <FiPackage className="h-14 w-14 text-gray-200" />
            <h2 className="font-heading text-2xl font-light">No orders yet</h2>
            <p className="text-sm text-gray-mid">
              Your order history will appear here.
            </p>
          </FadeIn>
        ) : (
          <ScrollReveal className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={scrollItemVariants}
                className="rounded-sm border border-gray-100 p-6"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-mid">
                      Order #{order.id}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-mid">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Items summary */}
                <div className="mt-4 border-t border-gray-50 pt-4">
                  <p className="text-xs text-gray-mid">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                    {order.items.length > 0 &&
                      ` — qty ${order.items.map((i) => i.quantity).join(", ")}`}
                  </p>
                </div>

                {/* Footer row */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-mid">
                    {order.city} · {order.phone}
                  </p>
                  <p className="text-sm font-medium text-gold">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
              </motion.div>
            ))}
          </ScrollReveal>
        )}
      </div>
    </main>
  );
}

export default function OrdersPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <main className="pt-20">
          <div className="mx-auto max-w-[1470px] px-6 py-16">
            <div className="mb-10 h-10 w-48 animate-pulse rounded-sm bg-gray-100" />
            <OrdersSkeleton />
          </div>
        </main>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
