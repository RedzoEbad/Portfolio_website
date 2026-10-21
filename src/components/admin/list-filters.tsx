"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { Select } from "@/components/ui/field";

/** URL-driven search + select filters for admin tables. */
export function ListFilters({ selects }: { selects: { name: string; label: string; options: { value: string; label: string }[] }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const push = (k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    sp.delete("page");
    start(() => router.replace(`${pathname}?${sp.toString()}`));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) push("q", q);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="relative min-w-[200px] flex-1">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-fog" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 w-full rounded-lg border border-line-strong bg-abyss/60 pr-3 pl-9 text-sm focus:border-signal focus:outline-none" />
      </label>
      {selects.map((s) => (
        <label key={s.name} className="w-auto">
          <span className="sr-only">{s.label}</span>
          <Select value={params.get(s.name) ?? ""} onChange={(e) => push(s.name, e.target.value)} className="w-44">
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </label>
      ))}
      {pending && <Loader2 className="h-4 w-4 animate-spin text-fog" />}
    </div>
  );
}
