"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FadeIn } from "@/components/animations";
import { AuthForm } from "@/components/auth";
import { BLUR_DATA_URL } from "@/lib/utils";
import type { AuthSubmitData } from "@/components/auth";
import { fetchCurrentUser, registerUser } from "@/lib/api";
import { useAuthStore } from "@/store";
import type { ApiError } from "@/types";

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  async function handleSubmit(data: AuthSubmitData): Promise<void> {
    setError("");
    setIsSubmitting(true);
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      const user = await fetchCurrentUser();
      setUser(user);
      router.push("/");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading || isAuthenticated) return <></>;

  return (
    <main className="flex min-h-[calc(100vh-80px)]">
      {/* Left — brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="/shampoo_banner.png"
          alt="Irha Beauty"
          fill
          priority
          sizes="50vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
          <FadeIn delay={0.1}>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Welcome to
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <h1 className="mt-3 font-heading text-6xl font-light">
              Irha Beauty
            </h1>
          </FadeIn>
          <FadeIn delay={0.6}>
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-white/70">
              Luxury hair care crafted for those who believe beauty is a ritual,
              not a routine.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <FadeIn delay={0.1}>
            <p className="text-xs uppercase tracking-widest text-gray-mid">
              Join us
            </p>
            <h2 className="mt-2 font-heading text-4xl font-light">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-gray-mid">
              Start your luxury hair care journey.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="mt-8">
            <AuthForm
              mode="register"
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              error={error}
            />
          </FadeIn>

          <FadeIn delay={0.5} className="mt-6 text-center">
            <p className="text-sm text-gray-mid">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
