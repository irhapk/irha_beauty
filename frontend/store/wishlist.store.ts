import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/types";

interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  removeItem: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((p) => p.id === product.id);
          return {
            items: exists
              ? state.items.filter((p) => p.id !== product.id)
              : [...state.items, product],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        })),

      isWishlisted: (productId) =>
        get().items.some((p) => p.id === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "irha-wishlist",
      skipHydration: true,
    },
  ),
);

export const useWishlistCount = (): number =>
  useWishlistStore((state) => state.items.length);
