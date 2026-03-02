"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { FiAward, FiDroplet, FiStar } from "react-icons/fi";

import { FadeIn, ScrollReveal, scrollItemVariants } from "@/components/animations";
import { BLUR_DATA_URL } from "@/lib/utils";

interface Value {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly title: string;
  readonly body: string;
}

const VALUES: Value[] = [
  {
    icon: FiAward,
    title: "Quality",
    body: "Every ingredient is hand-selected for purity and efficacy. We never compromise on what touches your hair.",
  },
  {
    icon: FiDroplet,
    title: "Luxury",
    body: "Our formulas are inspired by ancient beauty rituals, elevated with modern science for an indulgent experience.",
  },
  {
    icon: FiStar,
    title: "Trust",
    body: "Built on honesty and results. Our customers trust us because we've earned it — bottle by bottle.",
  },
];

export default function AboutPage(): React.ReactElement {
  return (
    <main className="pt-36">
      {/* Hero */}
      <div className="relative h-[70vh] overflow-hidden">
        <Image
          src="/shampoo_banner.png"
          alt="Irha Beauty — brand imagery"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <FadeIn className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Our Story
          </p>
          <h1 className="mt-4 font-heading text-4xl font-light sm:text-6xl">
            Irha Beauty
          </h1>
          <p className="mt-4 max-w-md text-base font-light leading-relaxed text-white/70">
            Luxury hair care for every ritual
          </p>
        </FadeIn>
      </div>

      {/* Brand story */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <ScrollReveal>
          <motion.div variants={scrollItemVariants}>
            <h2 className="font-heading text-4xl font-light">Why We Started</h2>
          </motion.div>
          <motion.p
            variants={scrollItemVariants}
            className="mt-6 text-base leading-8 text-gray-mid"
          >
            Irha Beauty was born from a simple belief: every woman deserves
            hair care that feels as good as it works. Our founder, inspired by
            generations of traditional hair rituals passed down through
            families, set out to create formulas that honour those roots while
            meeting the demands of modern life.
          </motion.p>
          <motion.p
            variants={scrollItemVariants}
            className="mt-4 text-base leading-8 text-gray-mid"
          >
            From cold-pressed oils sourced from local farms to salon-grade
            shampoos free of harsh chemicals, every Irha Beauty product is
            crafted with intention. We believe beauty should be a ritual — not
            a chore — and that luxury shouldn&apos;t come at the cost of your
            health or the earth.
          </motion.p>
          <motion.p
            variants={scrollItemVariants}
            className="mt-4 text-base leading-8 text-gray-mid"
          >
            Today, Irha Beauty is proudly built in Pakistan, serving customers
            who refuse to settle for ordinary. Our story is still being written
            — and we&apos;re grateful you&apos;re part of it.
          </motion.p>
        </ScrollReveal>
      </section>

      {/* Values */}
      <section className="bg-cream px-6 py-24">
        <div className="mx-auto max-w-[1470px]">
          <ScrollReveal className="mb-16 text-center">
            <motion.h2
              variants={scrollItemVariants}
              className="font-heading text-4xl font-light"
            >
              What We Stand For
            </motion.h2>
          </ScrollReveal>

          <ScrollReveal
            stagger={0.15}
            className="grid grid-cols-1 gap-12 md:grid-cols-3"
          >
            {VALUES.map((value) => (
              <motion.div
                key={value.title}
                variants={scrollItemVariants}
                className="flex flex-col items-center text-center"
              >
                <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-white">
                  <value.icon className="h-6 w-6 text-gold" />
                </span>
                <h3 className="font-heading text-2xl font-light">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-mid">
                  {value.body}
                </p>
              </motion.div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <ScrollReveal>
          <motion.div variants={scrollItemVariants} className="space-y-6">
            <h2 className="font-heading text-4xl font-light">
              Ready to Begin Your Ritual?
            </h2>
            <p className="mx-auto max-w-sm text-sm leading-7 text-gray-mid">
              Explore our curated collection of luxury hair care products.
            </p>
            <Link
              href="/products"
              className="inline-block rounded-full bg-black px-10 py-3.5 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold"
            >
              Discover Our Products
            </Link>
          </motion.div>
        </ScrollReveal>
      </section>
    </main>
  );
}
