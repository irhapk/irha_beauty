"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { FaInstagram } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";

import { FadeIn, ScrollReveal, scrollItemVariants } from "@/components/animations";
import { ContactForm } from "@/components/contact";

interface ContactItem {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value: string;
  readonly href: string;
}

interface SocialLink {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly href: string;
}

const CONTACT_ITEMS: ContactItem[] = [
  {
    icon: FiPhone,
    label: "Phone",
    value: "+92 312 1007112",
    href: "tel:+923121007112",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "info.irhapk0@gmail.com",
    href: "mailto:info.irhapk0@gmail.com",
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/irhapk/" },
];

export default function ContactPage(): React.ReactElement {
  return (
    <main className="pt-20">
      <div className="mx-auto max-w-[1470px] px-6 py-16">
        <FadeIn className="mb-16 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-mid">
            Get in Touch
          </p>
          <h1 className="mt-3 font-heading text-5xl font-light">Contact Us</h1>
          <p className="mt-3 text-sm text-gray-mid">
            We&apos;d love to hear from you. Our team responds within 24 hours.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Info column */}
          <ScrollReveal className="space-y-10">
            <motion.div variants={scrollItemVariants}>
              <h2 className="mb-6 font-heading text-2xl font-light">
                Reach Out Directly
              </h2>
              <div className="space-y-5">
                {CONTACT_ITEMS.map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200">
                      <item.icon className="h-4 w-4 text-gold" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-mid">
                        {item.label}
                      </p>
                      <Link
                        href={item.href}
                        className="mt-0.5 block text-sm transition-colors hover:text-gold"
                      >
                        {item.value}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={scrollItemVariants}>
              <h3 className="mb-4 font-heading text-xl font-light">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-gold hover:text-gold"
                  >
                    <social.icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={scrollItemVariants}
              className="rounded-sm border border-gray-100 p-6"
            >
              <p className="text-xs uppercase tracking-widest text-gray-mid">
                Business Hours
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-mid">
                Monday – Saturday: 10:00 AM – 7:00 PM
                <br />
                Sunday: Closed
              </p>
            </motion.div>
          </ScrollReveal>

          {/* Form column */}
          <FadeIn delay={0.2}>
            <h2 className="mb-6 font-heading text-2xl font-light">
              Send a Message
            </h2>
            <ContactForm />
          </FadeIn>
        </div>
      </div>
    </main>
  );
}
