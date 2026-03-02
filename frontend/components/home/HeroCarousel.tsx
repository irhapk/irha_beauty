"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { cn, BLUR_DATA_URL } from "@/lib/utils";
import { SLIDES } from "@/lib/slides";

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const PULSE_SHADOW = [
  "0 0 0 0px rgba(202,146,54,0)",
  "0 0 0 12px rgba(202,146,54,0.2)",
  "0 0 0 0px rgba(202,146,54,0)",
];

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.7, ease: EASE_OUT } },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  }),
};

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const isPaused = useRef(false);

  const paginate = useCallback((newDir: number) => {
    setDir(newDir);
    setCurrent((prev) => (prev + newDir + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPaused.current) paginate(1);
    }, 4000);
    return () => clearInterval(id);
  }, [paginate]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative overflow-hidden bg-black"
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
    >
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div
          key={slide.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative w-full"
        >
          {/* Image — full width, height auto so full image always shows */}
          <Image
            src={slide.bannerImage}
            alt={slide.headline}
            width={1080}
            height={1920}
            priority
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-black/50" />

          {/* Text content — centered over the image */}
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-3xl space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
                className="font-body text-xs tracking-[0.3em] uppercase text-gold"
              >
                {slide.subtitle}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT }}
                className="font-heading text-3xl font-light leading-tight text-white sm:text-4xl md:text-6xl lg:text-8xl"
              >
                {slide.headline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: EASE_OUT }}
                className="mx-auto max-w-md text-sm leading-relaxed text-white/80"
              >
                {slide.body}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.7, ease: EASE_OUT }}
              >
                <Link href={slide.ctaHref} className="inline-block">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ boxShadow: PULSE_SHADOW }}
                    transition={{ boxShadow: { duration: 2.5, repeat: Infinity } }}
                    className="inline-block cursor-pointer rounded-full border border-gold px-10 py-3.5 text-xs tracking-widest uppercase text-white transition-colors hover:bg-gold hover:text-black"
                  >
                    Discover Now
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrow navigation */}
      <button
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-white/60 transition-colors hover:text-gold sm:left-4"
      >
        <FiChevronLeft className="h-7 w-7" />
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-white/60 transition-colors hover:text-gold sm:right-4"
      >
        <FiChevronRight className="h-7 w-7" />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setDir(i > current ? 1 : -1);
              setCurrent(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current ? "w-8 bg-gold" : "w-2 bg-white/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
