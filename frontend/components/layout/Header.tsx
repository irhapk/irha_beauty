"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiMenu,
  FiPhone,
  FiSearch,
  FiUser,
} from "react-icons/fi";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logoutUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";

// ── Constants ──────────────────────────────────────────────────────────────

const PROMO_MESSAGES = [
  "Quality you can feel. Happiness guaranteed.",
  "Free Delivery on orders above Rs. 1,500",
  "100% Natural Ingredients · Cruelty Free",
] as const;

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/irhapk", icon: FaFacebookF, label: "Facebook" },
  { href: "https://www.instagram.com/irhapk/", icon: FaInstagram, label: "Instagram" },
  { href: "https://www.twitter.com/irhapk", icon: FaTwitter, label: "Twitter" },
  { href: "https://www.linkedin.com/company/irhapk", icon: FaLinkedinIn, label: "LinkedIn" },
  { href: "https://www.pinterest.com/irhapk", icon: FaPinterestP, label: "Pinterest" },
  { href: "https://wa.me/923121007112", icon: FaWhatsapp, label: "WhatsApp" },
] as const;

const NAV_LINKS = [
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

// ── Component ──────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Promo text auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((i) => (i + 1) % PROMO_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  function prevPromo() {
    setPromoIndex((i) => (i - 1 + PROMO_MESSAGES.length) % PROMO_MESSAGES.length);
  }
  function nextPromo() {
    setPromoIndex((i) => (i + 1) % PROMO_MESSAGES.length);
  }

  async function handleLogout(): Promise<void> {
    try {
      await logoutUser();
    } finally {
      useAuthStore.getState().clearUser();
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ── TopBar (black) — hides on scroll ── */}
      <div
        className={cn(
          "overflow-hidden bg-black transition-all duration-500 ease-in-out",
          scrolled ? "max-h-0" : "max-h-24",
        )}
      >
        <div className="mx-auto flex max-w-[1470px] items-center justify-between px-6 py-2.5">

          {/* Left: Social icons */}
          <div className="hidden items-center gap-1.5 md:flex">
            {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-200 hover:border-gold hover:text-gold"
              >
                <Icon className="h-3 w-3" />
              </a>
            ))}
          </div>

          {/* Center: Promo carousel */}
          <div className="flex flex-1 items-center justify-center gap-2">
            <button
              onClick={prevPromo}
              aria-label="Previous message"
              className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-white/60 hover:text-white"
            >
              <FiChevronLeft className="h-3 w-3" />
            </button>

            <div className="relative h-5 w-72 overflow-hidden text-center md:w-96">
              <AnimatePresence mode="wait">
                <motion.p
                  key={promoIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center text-xs tracking-wide text-white"
                >
                  {PROMO_MESSAGES[promoIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <button
              onClick={nextPromo}
              aria-label="Next message"
              className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-white/60 hover:text-white"
            >
              <FiChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Right: Phone + Email */}
          <div className="hidden flex-col items-end gap-0.5 md:flex">
            <a
              href="tel:+923121007112"
              className="flex items-center gap-1.5 text-xs text-white/80 transition-colors hover:text-gold"
            >
              <FiPhone className="h-3 w-3" />
              +92-312-100-7112
            </a>
            <a
              href="mailto:info.irhapk0@gmail.com"
              className="flex items-center gap-1.5 text-xs text-white/80 transition-colors hover:text-gold"
            >
              <FiMail className="h-3 w-3" />
              info.irhapk0@gmail.com
            </a>
          </div>

        </div>
      </div>

      {/* ── Navbar (white) ── */}
      <div
        className={cn(
          "bg-white transition-shadow duration-300",
          scrolled ? "shadow-md" : "border-b border-gray-100",
        )}
      >
        <div className="relative mx-auto flex max-w-[1470px] items-center justify-between px-6 py-4">

          {/* Left: Menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation menu"
                className="flex items-center gap-2 text-black transition-colors hover:text-gold"
              >
                <FiMenu className="h-5 w-5" />
                <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] sm:block">
                  Menu
                </span>
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              aria-describedby={undefined}
              className="w-72 border-white/10 bg-black text-white"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block py-3 font-heading text-lg transition-colors",
                      pathname === link.href ? "text-gold" : "text-white hover:text-gold",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-2">
                  <p className="mb-1 text-xs uppercase tracking-widest text-gray-light">
                    Categories
                  </p>
                  {CATEGORY_LINKS.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 text-sm text-white transition-colors hover:text-gold"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4">
                  {isAuthenticated && user ? (
                    <>
                      {user.email === "info.irhapk0@gmail.com" && (
                        <Link
                          href="/admin/orders"
                          onClick={() => setMobileOpen(false)}
                          className="block py-2.5 text-sm text-gold"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-sm text-gray-light transition-colors hover:text-gold"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="py-2.5 text-left text-sm text-gray-light transition-colors hover:text-gold"
                      >
                        Logout ({user.full_name})
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-sm text-white hover:text-gold"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-sm text-gold"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Center: Brand name (absolutely centered) */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <span className="font-heading text-2xl font-semibold tracking-[0.12em] text-black transition-colors hover:text-gold md:text-3xl">
              Irha Beauty
            </span>
          </Link>

          {/* Right: Nav icons */}
          <div className="flex items-center">
            {/* Search — desktop only */}
            <Link
              href="/products"
              aria-label="Search products"
              className="hidden h-10 w-10 items-center justify-center text-black transition-colors hover:text-gold md:flex"
            >
              <FiSearch className="h-5 w-5" />
            </Link>

            {/* User — desktop only */}
            {isAuthenticated && user ? (
              <Link
                href="/orders"
                aria-label="My account"
                className="hidden h-10 w-10 items-center justify-center text-black transition-colors hover:text-gold md:flex"
              >
                <FiUser className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="hidden h-10 w-10 items-center justify-center text-black transition-colors hover:text-gold md:flex"
              >
                <FiUser className="h-5 w-5" />
              </Link>
            )}

            <WishlistIcon />
            <CartIcon />
          </div>

        </div>
      </div>

    </header>
  );
}
