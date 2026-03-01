"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { FiCheckCircle, FiLoader } from "react-icons/fi";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFields {
  name: string;
  email: string;
  message: string;
}

type FieldErrors = Partial<Record<keyof FormFields, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const SUBMIT_DELAY_MS = 800;

export function ContactForm(): React.ReactElement {
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!fields.name.trim()) errs.name = "Name is required.";
    if (!fields.email.trim()) {
      errs.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(fields.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!fields.message.trim()) errs.message = "Message is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(key: keyof FormFields, value: string): void {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise<void>((resolve) =>
      setTimeout(resolve, SUBMIT_DELAY_MS),
    );
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="flex flex-col items-center justify-center space-y-4 rounded-sm border border-green-200 bg-green-50 px-6 py-16 text-center"
      >
        <FiCheckCircle className="h-10 w-10 text-green-500" />
        <h3 className="font-heading text-2xl font-light">Message Received</h3>
        <p className="text-sm text-gray-mid">
          Thank you! We&apos;ll be in touch within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          type="text"
          value={fields.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Your name"
          aria-invalid={!!errors.name}
          className={errors.name ? "border-red-400" : ""}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          value={fields.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          className={errors.email ? "border-red-400" : ""}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          rows={5}
          value={fields.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="How can we help you?"
          aria-invalid={!!errors.message}
          className={cn(
            "w-full resize-none rounded-sm border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring",
            errors.message
              ? "border-red-400 bg-background"
              : "border-input bg-background",
          )}
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-black py-4 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <FiLoader className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
