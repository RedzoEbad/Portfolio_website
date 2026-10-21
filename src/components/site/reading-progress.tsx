"use client";

import { motion, useScroll } from "motion/react";

/** Direct scroll progress — no spring lag fighting the main thread. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-ion will-change-transform" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}
