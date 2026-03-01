"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { FiLoader, FiPackage, FiRefreshCw } from "react-icons/fi";

import { FadeIn, ScrollReveal, scrollItemVariants } from "@/components/animations";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllOrders, updateOrderStatus } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store";
import type { Order } from "@/types";

const ADMIN_EMAIL = "info.irhabeauty@gmail.com";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_OPTIONS: Order["status"][] = [
  "pending",
  "processing",
  "delivered",
  "cancelled",
];

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={n} className="space-y-3 rounded-sm border border-gray-100 p-6">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const isAdmin = isAuthenticated && user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllOrders()
      .then(setOrders)
      .catch(() => setError("Failed to load orders."))
      .finally(() => setIsLoading(false));
  }, [isAdmin]);

  async function handleStatusChange(orderId: number, status: Order["status"]) {
    setUpdating(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o)),
      );
    } catch {
      // status change failed — keep existing state
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading) return (
    <main className="flex min-h-screen items-center justify-center pt-20">
      <FiLoader className="h-8 w-8 animate-spin text-gold" />
    </main>
  );

  if (!isAdmin) return <></>;


  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-10">
          <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
          <h1 className="mt-1 font-heading text-4xl font-light">All Orders</h1>
          {!isLoading && !error && (
            <p className="mt-1 text-sm text-gray-mid">
              {orders.length} {orders.length === 1 ? "order" : "orders"} total
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
          </FadeIn>
        ) : (
          <ScrollReveal className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={scrollItemVariants}
                className="rounded-sm border border-gray-100 p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left: order info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="text-xs uppercase tracking-widest text-gray-mid">
                        Order #{order.id}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="font-heading text-lg font-light">
                      {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-mid">
                      {order.email}
                    </p>
                    <p className="text-sm text-gray-mid">
                      {order.city} · {order.phone}
                    </p>
                    <p className="text-xs text-gray-mid">
                      {formatDate(order.created_at)}
                    </p>
                    <div className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-xs text-gray-mid">
                          {item.product_name} × {item.quantity}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs font-medium text-gold">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>

                  {/* Right: status selector */}
                  <div className="flex items-center gap-3">
                    {updating === order.id && (
                      <FiRefreshCw className="h-4 w-4 animate-spin text-gold" />
                    )}
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as Order["status"])
                      }
                      className="rounded-sm border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <p className="mt-3 border-t border-gray-50 pt-3 text-xs text-gray-mid">
                  {order.address}, {order.city}
                </p>
              </motion.div>
            ))}
          </ScrollReveal>
        )}
      </div>
    </main>
  );
}
