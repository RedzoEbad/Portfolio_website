"use client";

import { animate, motion, useInView, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery, useSafeReducedMotion } from "@/lib/hooks";

/**
 * Reveal: content is always rendered and readable; motion only adds a short entrance.
 * Variants are intentionally different per component family.
 */
/** Opacity/transform only — never clip-path or filter (those stall scrolling). */
const VARIANTS = {
  rise: { hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 } },
  clip: { hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 } },
  wipe: { hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
  scale: { hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } },
  blur: { hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } },
} as const;

export function Reveal({ children, variant = "rise", delay = 0, className, as = "div", ...rest }: { children: ReactNode; variant?: keyof typeof VARIANTS; delay?: number; className?: string; as?: "div" | "section" | "li" | "article" } & Omit<HTMLMotionProps<"div">, "children">) {
  const reduce = useSafeReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  if (reduce) return <Comp className={className}>{children}</Comp>;
  return (
    <Comp
      data-reveal=""
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -6% 0px", amount: 0.1 }}
      variants={VARIANTS[variant]}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Staggered children; each child should be a <StaggerItem>. */
export function Stagger({ children, className, gap = 0.06 }: { children: ReactNode; className?: string; gap?: number }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : "hidden"} whileInView="shown" viewport={{ once: true, margin: "0px 0px -10% 0px" }} transition={{ staggerChildren: gap }}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      data-reveal=""
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </Comp>
  );
}

/** Magnetic pull on fine pointers only. Keyboard and touch users get a normal button. */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const reduce = useSafeReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const fine = useMediaQuery("(pointer: fine)");
  const active = fine && !reduce;
  return (
    <motion.span
      className={cn("inline-flex", className)}
      style={active ? { x, y } : undefined}
      onPointerMove={(e: PointerEvent<HTMLSpanElement>) => {
        if (!active) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** Tracks the pointer as --mx/--my CSS variables for .pointer-glow surfaces. */
export function PointerGlow({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("pointer-glow", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Counts up to a real number once visible. Renders the final value for reduced motion and no-JS. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useSafeReducedMotion();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!inView || reduce || value === 0) return;
    const ctrl = animate(0, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, reduce, value]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {shown}
    </span>
  );
}
