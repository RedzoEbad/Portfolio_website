"use client";

import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Reading-progress bar plus a scroll-spy section list (sticky on desktop, a pill strip on mobile). */
export function CaseStudyNav({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-gradient-to-r from-signal via-ion to-flare will-change-transform" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <nav aria-label="Case study sections" className="lg:sticky lg:top-28">
        <p className="mb-3 hidden text-sm text-fog lg:block">On this page</p>
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0">
          {items.map((i) => (
            <li key={i.id} className="shrink-0">
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? "true" : undefined}
                className={cn(
                  "relative block rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors lg:rounded-none lg:border-0 lg:border-l lg:py-1.5 lg:pl-4",
                  active === i.id ? "border-signal text-frost lg:border-signal" : "border-line text-fog hover:text-frost lg:border-line",
                )}
              >
                {active === i.id && <motion.span layoutId="cs-active" className="absolute top-0 bottom-0 -left-px hidden w-0.5 bg-signal lg:block" />}
                {i.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
