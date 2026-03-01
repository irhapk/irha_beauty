"use client";

import { useState } from "react";

import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";

import { FadeIn } from "@/components/animations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AuthSubmitData {
  full_name: string;
  email: string;
  password: string;
}

interface FieldErrors {
  full_name?: string;
  email?: string;
  password?: string;
}

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthSubmitData) => Promise<void>;
  isLoading: boolean;
  error: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

function validate(mode: "login" | "register", data: AuthSubmitData): FieldErrors {
  const errs: FieldErrors = {};
  if (mode === "register" && !data.full_name.trim()) {
    errs.full_name = "Full name is required.";
  }
  if (!data.email.trim()) {
    errs.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errs.email = "Enter a valid email address.";
  }
  if (!data.password) {
    errs.password = "Password is required.";
  } else if (data.password.length < PASSWORD_MIN) {
    errs.password = `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  return errs;
}

export function AuthForm({
  mode,
  onSubmit,
  isLoading,
  error,
}: AuthFormProps): React.ReactElement {
  const [fields, setFields] = useState<AuthSubmitData>({
    full_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    const errs = validate(mode, fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit(fields);
  }

  function handleChange(
    key: keyof AuthSubmitData,
    value: string,
  ): void {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {mode === "register" && (
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            type="text"
            value={fields.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            placeholder="Your full name"
            aria-invalid={!!errors.full_name}
            className={errors.full_name ? "border-red-400" : ""}
          />
          {errors.full_name && (
            <p className="text-xs text-red-500">{errors.full_name}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
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
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={fields.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className={cn("pr-10", errors.password ? "border-red-400" : "")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <FiEyeOff className="h-4 w-4" />
            ) : (
              <FiEye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {error && (
        <FadeIn>
          <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        </FadeIn>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-black py-4 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <FiLoader className="h-4 w-4 animate-spin" />
            {mode === "login" ? "Signing In…" : "Creating Account…"}
          </>
        ) : mode === "login" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
