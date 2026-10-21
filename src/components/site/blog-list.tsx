import Link from "next/link";
import type { BlogCardDTO, BlogCategoryDTO, Paginated } from "@/lib/content/types";
import { BlogCard } from "./blog-card";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { cn } from "@/lib/utils";

export function BlogCategoryNav({ categories, active }: { categories: BlogCategoryDTO[]; active?: string }) {
  const used = categories.filter((c) => (c.postCount ?? 0) > 0 || c.slug === active);
  if (!used.length) return null;
  return (
    <nav aria-label="Blog categories" className="mb-12">
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <li>
          <Link href="/blog" aria-current={!active ? "page" : undefined} className={cn("block shrink-0 rounded-full border px-3 py-1 text-sm", !active ? "border-frost bg-frost text-abyss" : "border-line text-fog hover:text-frost")}>
            All
          </Link>
        </li>
        {used.map((c) => (
          <li key={c._id}>
            <Link
              href={`/blog/category/${c.slug}`}
              aria-current={active === c.slug ? "page" : undefined}
              className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm whitespace-nowrap", active === c.slug ? "text-frost" : "border-line text-fog hover:text-frost")}
              style={active === c.slug ? { borderColor: c.color, background: `color-mix(in srgb, ${c.color} 16%, transparent)` } : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
              {c.name}
              <span className="font-mono text-xs opacity-70">{c.postCount ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function BlogGrid({ result, basePath, params, emptyTitle }: { result: Paginated<BlogCardDTO>; basePath: string; params: Record<string, string | undefined>; emptyTitle: string }) {
  if (!result.items.length) return <EmptyState title={emptyTitle} body="Published articles appear here, newest first." />;
  return (
    <>
      <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((p) => (
          <li key={p._id}>
            <BlogCard post={p} />
          </li>
        ))}
      </ul>
      <Pagination page={result.page} pages={result.pages} basePath={basePath} params={params} />
    </>
  );
}
