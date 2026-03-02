import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  popupProduct: Product | null;
  popupOpen: boolean;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  showPopup: (product: Product) => void;
  hidePopup: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      popupProduct: null,
      popupOpen: false,

      addItem: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.id,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + qty }
                  : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.price,
                quantity: qty,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId
                    ? { ...item, quantity: qty }
                    : item,
                ),
        })),

      clearCart: () => set({ items: [] }),

      showPopup: (product) => set({ popupProduct: product, popupOpen: true }),

      hidePopup: () => set({ popupOpen: false }),
    }),
    {
      name: "irha-cart",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Derived selector — total amount, not stored in state */
export const useCartTotal = (): number =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

/** Derived selector — item count */
export const useCartCount = (): number =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
