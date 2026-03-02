"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { FadeIn } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BLUR_DATA_URL } from "@/lib/utils";
import type { Category } from "@/types";

interface ComingSoonProps {
  category: Category;
}

export function ComingSoon({ category }: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNotify(e: React.FormEvent): void {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center">
      {/* Background */}
      <Image
        src={category.bannerImage}
        alt={category.name}
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/65" />

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        <FadeIn delay={0.1} className="mb-4">
          <p className="text-xs tracking-[0.3em] uppercase text-gold">
            {category.name}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h1 className="font-heading text-6xl font-light text-white md:text-8xl lg:text-[120px]">
            Coming Soon
          </h1>
        </FadeIn>

        <FadeIn delay={0.6} className="mt-4 mb-10">
          <p className="text-sm text-white/70">
            We&apos;re crafting something exceptional. Stay tuned.
          </p>
        </FadeIn>

        <FadeIn delay={0.9}>
          {submitted ? (
            <p className="text-sm text-gold">
              Thank you! We&apos;ll notify you when it&apos;s ready.
            </p>
          ) : (
            <form
              onSubmit={handleNotify}
              className="mx-auto flex max-w-sm justify-center gap-2"
            >
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-gold"
              />
              <Button
                type="submit"
                className="shrink-0 bg-gold text-black hover:bg-gold/90"
              >
                Notify Me
              </Button>
            </form>
          )}
        </FadeIn>

        <FadeIn delay={1.1} className="mt-8">
          <Link
            href="/"
            className="text-xs tracking-widest uppercase text-white/60 transition-colors hover:text-gold"
          >
            ← Back to Homepage
          </Link>
        </FadeIn>
      </div>
    </main>
  );
}
