"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Section list + lightweight progress bar (DOM only — no Framer useScroll). */
export function CaseStudyNav({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const barRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${p})`;
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div ref={barRef} className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-gradient-to-r from-signal via-ion to-flare" style={{ transform: "scaleX(0)" }} aria-hidden="true" />
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
                {active === i.id && <span className="absolute top-0 bottom-0 -left-px hidden w-0.5 bg-signal lg:block" aria-hidden="true" />}
                {i.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
