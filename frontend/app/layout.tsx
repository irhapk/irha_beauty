import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Instrument_Sans,
} from "next/font/google";

import { CartPopup } from "@/components/layout/CartPopup";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PageTransition } from "@/components/animations";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Irha Beauty",
    template: "%s | Irha Beauty",
  },
  description:
    "Premium luxury hair care — Argan shampoos, pure hair oils, signature fragrances. Crafted in Pakistan.",
  keywords: ["hair care", "shampoo", "argan oil", "luxury beauty", "Pakistan", "hair oil", "fragrance"],
  openGraph: {
    title: "Irha Beauty",
    description:
      "Premium luxury hair care — Argan shampoos, pure hair oils, signature fragrances.",
    type: "website",
    locale: "en_PK",
    siteName: "Irha Beauty",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${instrumentSans.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <ScrollProgress />
          <Header />
          <CartPopup />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
