import Link from "next/link";

import { FadeIn } from "@/components/animations";

export const metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-36 text-center">
      <FadeIn className="space-y-6">
        <p className="font-heading text-[10rem] font-light leading-none text-gold">
          404
        </p>
        <div>
          <h1 className="font-heading text-3xl font-light">Page Not Found</h1>
          <p className="mt-2 text-sm text-gray-mid">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block rounded-full bg-black px-8 py-3 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold"
        >
          Back to Home
        </Link>
      </FadeIn>
    </main>
  );
}
