"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiMenu } from "react-icons/fi";

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

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const CATEGORY_LINKS = [
  { href: "/categories/shampoo", label: "Shampoo" },
  { href: "/categories/oils", label: "Oils" },
  { href: "/categories/fragrance", label: "Fragrance" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout(): Promise<void> {
    try {
      await logoutUser();
    } finally {
      useAuthStore.getState().clearUser();
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-black/90 backdrop-blur-md"
          : "bg-black",
      )}
    >
      <div className="mx-auto flex max-w-[1470px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.jpeg"
            alt="Irha Beauty"
            width={44}
            height={44}
            className="object-contain invert"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={pathname === link.href}
            />
          ))}

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            <button
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                pathname.startsWith("/categories")
                  ? "text-gold"
                  : "text-white hover:text-gold",
              )}
            >
              Categories
              <FiChevronDown
                className={cn(
                  "transition-transform duration-200",
                  catOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 min-w-[160px] overflow-hidden rounded-md border border-white/10 bg-black py-2 shadow-xl"
                >
                  {CATEGORY_LINKS.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-2 text-sm text-white transition-colors hover:bg-white/5 hover:text-gold"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop icons */}
        <div className="hidden items-center gap-5 md:flex">
          <WishlistIcon />
          <CartIcon />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 text-sm">
              {user.email === "info.irhapk0@gmail.com" && (
                <Link
                  href="/admin/orders"
                  className="text-xs text-gold transition-colors hover:text-gold/70"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="text-xs text-gray-light transition-colors hover:text-gold"
              >
                Orders
              </Link>
              <span className="font-medium text-gold">
                {user.full_name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-light transition-colors hover:text-gold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className="text-white transition-colors hover:text-gold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-gold px-4 py-1.5 text-xs font-medium text-gold transition-all hover:bg-gold hover:text-black"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile cart + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <CartIcon />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button aria-label="Open navigation menu" className="p-2.5 -mr-2.5 text-white">
              <FiMenu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
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
                    pathname === link.href
                      ? "text-gold"
                      : "text-white hover:text-gold",
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

              <div className="flex flex-col gap-1 border-t border-white/10 pt-4 mt-2">
                <div className="flex gap-5 py-2">
                  <WishlistIcon />
                </div>
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
        </div>
      </div>
    </header>
  );
}

// Active-link underline uses Framer Motion layoutId for smooth transition
function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-medium transition-colors",
        active ? "text-gold" : "text-white hover:text-gold",
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
        />
      )}
    </Link>
  );
}
