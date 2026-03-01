"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { BLUR_DATA_URL } from "@/lib/utils";
import { REVIEWS } from "@/lib/reviews";

const INTERVAL_MS = 5000;
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export function ReviewsCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % REVIEWS.length);
    }, INTERVAL_MS);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function goTo(index: number) {
    setDirection(index > active ? 1 : -1);
    setActive(index);
    resetTimer();
  }

  function goPrev() {
    setDirection(-1);
    setActive((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
    resetTimer();
  }

  function goNext() {
    setDirection(1);
    setActive((prev) => (prev + 1) % REVIEWS.length);
    resetTimer();
  }

  const review = REVIEWS[active];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <section className="bg-cream/40 py-24">
      <div className="mx-auto max-w-[1470px] px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mb-16 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            What Our Customers Say
          </p>
          <h2 className="mt-3 font-heading text-4xl font-light">
            Real Results, Real People
          </h2>
        </motion.div>

        {/* Card */}
        <div className="relative mx-auto max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="rounded-sm border border-gray-100 bg-white px-5 py-8 text-center shadow-sm sm:px-8 sm:py-10"
            >
              {/* Stars */}
              <div className="mb-5 flex justify-center gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <FaStar key={i} className="h-4 w-4 text-gold" />
                ))}
              </div>

              {/* Review text */}
              <p className="font-heading text-lg font-light leading-relaxed text-gray-700">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Divider */}
              <div className="mx-auto my-6 h-px w-12 bg-gold/30" />

              {/* Reviewer */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold/20">
                  <Image
                    src={review.image}
                    alt={review.name}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="text-xs text-gray-mid">{review.designation}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={goPrev}
            aria-label="Previous review"
            className="absolute -left-5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-gold hover:text-gold sm:-left-7"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Next review"
            className="absolute -right-5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-gold hover:text-gold sm:-right-7"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dot navigation */}
        <div className="mt-8 flex justify-center gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to review ${i + 1}`}
              className="flex h-8 items-center px-1"
            >
              <span
                className="block h-2 rounded-full transition-all duration-300"
                style={{
                  width: active === i ? "24px" : "8px",
                  backgroundColor: active === i ? "var(--color-gold)" : "#d1d5db",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
