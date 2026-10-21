"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import { THEMES, type ThemeId } from "@/lib/themes";
import { useHydrated, useSafeReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

function flashThemeTransition() {
  const root = document.documentElement;
  root.classList.add("theme-animate");
  window.setTimeout(() => root.classList.remove("theme-animate"), 480);
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useHydrated();
  const reduce = useSafeReducedMotion();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const active = (mounted ? theme : "dark") as ThemeId;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: ThemeId) => {
    flashThemeTransition();
    setTheme(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg text-fog transition-colors hover:bg-hull-2 hover:text-frost",
          open && "bg-hull-2 text-frost",
        )}
        aria-label="Choose theme"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        title="Themes"
      >
        <Palette className="h-[18px] w-[18px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="listbox"
            aria-label="Color themes"
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+0.5rem)] right-0 z-[80] w-[min(92vw,17.5rem)] origin-top-right overflow-hidden rounded-2xl border border-line-strong bg-hull p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)]"
          >
            <p className="px-2.5 pt-1.5 pb-2 font-mono text-[11px] tracking-wide text-fog uppercase">Themes</p>
            <ul className="space-y-1">
              {THEMES.map((t) => {
                const selected = active === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => pick(t.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                        selected ? "bg-signal/12 ring-1 ring-signal/40" : "hover:bg-hull-2",
                      )}
                    >
                      <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                        {t.swatches.map((c) => (
                          <span key={c} className="h-5 w-5 rounded-full border border-line-strong shadow-sm" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-frost">{t.label}</span>
                        <span className="block truncate text-xs text-fog">{t.blurb}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-signal" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
