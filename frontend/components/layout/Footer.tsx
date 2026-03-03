"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";

import { ScrollReveal, scrollItemVariants } from "@/components/animations";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const CATEGORY_LINKS = [
  { href: "/categories/facewash", label: "Facewash" },
  { href: "/categories/shampoo", label: "Shampoo" },
  { href: "/categories/oils", label: "Hair Oils" },
  { href: "/categories/fragrance", label: "Fragrance" },
] as const;

const SOCIALS = [
  { href: "https://www.instagram.com/irhapk/", icon: FaInstagram, label: "Instagram" },
  { href: "tel:+923121007112", icon: FiPhone, label: "Phone" },
] as const;

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <ScrollReveal className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div variants={scrollItemVariants} className="space-y-4">
            <Image
              src="/logo.png"
              alt="Irhapk"
              width={36}
              height={36}
              className="rounded-full object-cover bg-black p-1"
            />
            <p className="text-sm leading-relaxed text-gray-light">
              Premium beauty products crafted with nature&apos;s finest
              ingredients. Elegance in every drop.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={scrollItemVariants} className="space-y-4">
            <h4 className="font-heading text-lg tracking-wide text-gold">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-light transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={scrollItemVariants} className="space-y-4">
            <h4 className="font-heading text-lg tracking-wide text-gold">
              Categories
            </h4>
            <ul className="space-y-2">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-light transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={scrollItemVariants} className="space-y-4">
            <h4 className="font-heading text-lg tracking-wide text-gold">
              Connect
            </h4>
            <div className="flex gap-2">
              {SOCIALS.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center text-gray-light transition-colors hover:text-gold"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1470px] flex-col items-center gap-1 px-6 py-4 text-center text-xs text-gray-light sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {new Date().getFullYear()} Irha Beauty. All rights reserved.</p>
          <p>Made with love for luxurious beauty.</p>
        </div>
      </div>
    </footer>
  );
}
