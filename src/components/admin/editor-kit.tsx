"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function Tabs<T extends string>({ tabs, value, onChange, errors = {} }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void; errors?: Partial<Record<T, boolean>> }) {
  return (
    <div role="tablist" aria-label="Editor sections" className="-mx-1 mb-6 flex gap-1 overflow-x-auto border-b border-line px-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`panel-${t.id}`}
          onClick={() => onChange(t.id)}
          className={cn("relative shrink-0 px-3 py-2.5 text-sm whitespace-nowrap transition-colors", value === t.id ? "text-frost" : "text-fog hover:text-frost")}
        >
          {t.label}
          {errors[t.id] && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-flare align-middle" aria-label="has errors" />}
          {value === t.id && <motion.span layoutId="editor-tab" className="absolute inset-x-2 -bottom-px h-0.5 bg-signal" />}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ id, active, children }: { id: string; active: boolean; children: React.ReactNode }) {
  // Kept mounted so form state is preserved across tabs.
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={!active} className="space-y-6">
      {children}
    </div>
  );
}

/** Warns before leaving the page with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
}

export function move<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}
