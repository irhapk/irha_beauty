"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { FiCheck, FiLoader } from "react-icons/fi";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrder } from "@/lib/api";
import { formatPrice, DELIVERY_CHARGE } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store";
import type { ApiError, CreateOrderPayload } from "@/types";

interface FormFields {
  customer_name: string;
  address: string;
  city: string;
  phone: string;
}

type FieldErrors = Partial<Record<keyof FormFields, string>>;

const FIELD_LABELS: Record<keyof FormFields, string> = {
  customer_name: "Full Name",
  address: "Address",
  city: "City",
  phone: "Phone",
};

const FIELD_KEYS: (keyof FormFields)[] = [
  "customer_name",
  "address",
  "city",
  "phone",
];

interface CheckoutFormProps {
  onSuccess: (grandTotal: number) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps): React.ReactElement {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartTotal();
  const grandTotal = subtotal + DELIVERY_CHARGE;

  const [fields, setFields] = useState<FormFields>({
    customer_name: "",
    address: "",
    city: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!fields.customer_name.trim()) next.customer_name = "Full name is required.";
    if (!fields.address.trim()) next.address = "Address is required.";
    if (!fields.city.trim()) next.city = "City is required.";
    if (!fields.phone.trim()) {
      next.phone = "Phone is required.";
    } else if (fields.phone.replace(/\D/g, "").length < 10) {
      next.phone = "Phone must be at least 10 digits.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setIsSubmitting(true);

    const payload: CreateOrderPayload = {
      customer_name: fields.customer_name,
      address: fields.address,
      city: fields.city,
      phone: fields.phone,
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      payment_method: "cod",
      total_amount: grandTotal,
    };

    try {
      await createOrder(payload);
      clearCart();
      onSuccess(grandTotal);
    } catch (err) {
      const apiErr = err as ApiError;
      setApiError(apiErr.detail ?? "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  }

  function handleChange(field: keyof FormFields, value: string): void {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="space-y-4">
        {FIELD_KEYS.map((key) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key}>{FIELD_LABELS[key]}</Label>
            <Input
              id={key}
              name={key}
              type={key === "phone" ? "tel" : "text"}
              value={fields[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={FIELD_LABELS[key]}
              aria-invalid={!!errors[key]}
              className={
                errors[key]
                  ? "border-red-400 focus-visible:ring-red-400/30"
                  : ""
              }
            />
            {errors[key] && (
              <p className="text-xs text-red-500">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="rounded-sm border border-gray-100 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gray-mid">
          Payment Method
        </p>
        <div className="flex items-center gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black">
            <FiCheck className="h-3 w-3 text-white" />
          </span>
          <span className="text-sm">Cash on Delivery</span>
        </div>
      </div>

      {apiError && <p className="text-sm text-red-500">{apiError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-black py-4 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <FiLoader className="h-4 w-4 animate-spin" />
            Placing Order…
          </>
        ) : (
          `Place Order · ${formatPrice(grandTotal)}`
        )}
      </button>
    </motion.form>
  );
}
