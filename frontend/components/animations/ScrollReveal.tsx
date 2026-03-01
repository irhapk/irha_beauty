"use client";

import { motion, type Variants } from "framer-motion";

// Bezier equivalent of easeOut — avoids TS string-union mismatch with Easing type
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export const scrollItemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  stagger?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  className,
  stagger,
}: ScrollRevealProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger ?? 0.1,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
