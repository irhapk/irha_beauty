"use client";

import { useEffect } from "react";

import { useCartStore, useWishlistStore } from "@/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
