"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, Loader2, Rows3, Search, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type Cat = { slug: string; name: string; color: string; count: number };

/**
 * Filter bar for /projects and category pages. State lives in the URL, so results are
 * rendered on the server, shareable, and work without JavaScript (the form submits normally).
 */
export function ProjectExplorer({ categories, technologies, total, lockedCategory, children }: { categories: Cat[]; technologies: string[]; total: number; lockedCategory?: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const first = useRef(true);

  const view = params.get("view") === "list" ? "list" : "grid";
  const category = lockedCategory ?? params.get("category") ?? "";
  const tech = params.get("tech") ?? "";
  const sort = params.get("sort") ?? "featured";

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
    if (!("page" in next)) sp.delete("page");
    const qs = sp.toString();
    start(() => router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  }

  // Debounced search
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update({ q: q || null });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeFilters = [category && !lockedCategory, tech, params.get("q")].filter(Boolean).length;

  return (
    <div>
      <form
        role="search"
        action={pathname}
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q || null });
        }}
        className="glass sticky top-16 z-30 -mx-4 mb-10 space-y-4 border-x-0 px-4 py-4 sm:mx-0 sm:rounded-2xl sm:border-x"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fog" aria-hidden="true" />
            <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, tag or technology" className="h-10 w-full rounded-lg border border-line-strong bg-abyss/60 pr-9 pl-9 text-sm placeholder:text-fog focus:border-signal focus:outline-none" />
            {q && (
              <button type="button" onClick={() => setQ("")} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-fog hover:text-frost" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
          <label className="flex items-center gap-2 text-sm text-fog">
            <span className="sr-only sm:not-sr-only">Technology</span>
            <select name="tech" value={tech} onChange={(e) => update({ tech: e.target.value || null })} className="h-10 max-w-[12rem] rounded-lg border border-line-strong bg-abyss/60 px-3 text-sm text-frost focus:border-signal focus:outline-none">
              <option value="">Any</option>
              {technologies.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              {tech && !technologies.includes(tech) && <option value={tech}>{tech}</option>}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-fog">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select name="sort" value={sort} onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })} className="h-10 rounded-lg border border-line-strong bg-abyss/60 px-3 text-sm text-frost focus:border-signal focus:outline-none">
              <option value="featured">Featured first</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A–Z</option>
            </select>
          </label>
          <div className="flex rounded-lg border border-line-strong p-0.5" role="group" aria-label="Layout">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} type="button" onClick={() => update({ view: v === "grid" ? null : v, page: params.get("page") })} aria-pressed={view === v} className={cn("relative grid h-8 w-9 place-items-center rounded-md transition-colors", view === v ? "text-signal-ink" : "text-fog hover:text-frost")} aria-label={v === "grid" ? "Grid view" : "Editorial list view"}>
                {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-md bg-signal" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}</span>
              </button>
            ))}
          </div>
          <noscript>
            <button type="submit" className="h-10 rounded-lg bg-signal px-4 text-sm text-signal-ink">
              Apply
            </button>
          </noscript>
        </div>

        {!lockedCategory && categories.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Category">
            <button type="button" onClick={() => update({ category: null })} aria-pressed={!category} className={cn("shrink-0 rounded-full border px-3 py-1 text-sm transition-colors", !category ? "border-frost bg-frost text-abyss" : "border-line text-fog hover:text-frost")}>
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => update({ category: category === c.slug ? null : c.slug })}
                aria-pressed={category === c.slug}
                className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors", category === c.slug ? "text-frost" : "border-line text-fog hover:text-frost")}
                style={category === c.slug ? { borderColor: c.color, background: `color-mix(in srgb, ${c.color} 16%, transparent)` } : undefined}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                {c.name}
                <span className="font-mono text-xs opacity-70">{c.count}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="mb-6 flex items-center justify-between text-sm text-fog" aria-live="polite">
        <span className="inline-flex items-center gap-2">
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          {total} project{total === 1 ? "" : "s"}
        </span>
        {activeFilters > 0 && (
          <button type="button" onClick={() => update({ q: null, tech: null, category: lockedCategory ? null : null, sort: null })} className="hover:text-frost">
            Clear filters
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={params.toString()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: pending ? 0.45 : 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
