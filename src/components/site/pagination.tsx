import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, pages, basePath, params }: { page: number; pages: number; basePath: string; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && k !== "page" && sp.set(k, v));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-line-strong" aria-label="Previous page" scroll={false}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-line opacity-40" aria-hidden="true">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}
      {nums.map((n, i) => (
        <span key={n} className="flex items-center">
          {i > 0 && nums[i - 1] !== n - 1 && <span className="px-1 text-fog">…</span>}
          <Link href={href(n)} aria-current={n === page ? "page" : undefined} className={cn("grid h-9 min-w-9 place-items-center rounded-lg px-2 font-mono text-sm", n === page ? "bg-signal text-signal-ink" : "text-fog hover:bg-hull-2 hover:text-frost")}>
            {n}
          </Link>
        </span>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-line-strong" aria-label="Next page" scroll={false}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-line opacity-40" aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
