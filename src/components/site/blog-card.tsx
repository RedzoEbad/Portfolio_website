import Link from "next/link";
import type { BlogCardDTO } from "@/lib/content/types";
import { SmartImage } from "@/components/media/smart-image";
import { CoverFallback } from "@/components/media/cover-fallback";
import { formatDate } from "@/lib/utils";
import { SampleBadge } from "./project-card";

export function BlogCard({ post }: { post: BlogCardDTO }) {
  const color = post.categories[0]?.color ?? "#9d6bff";
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-line bg-hull">
        {post.coverImage?.url ? (
          <SmartImage src={post.coverImage.url} alt={post.coverImage.alt || ""} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-[transform,filter] duration-500 group-hover:scale-[1.03] group-hover:saturate-[1.15]" />
        ) : (
          <CoverFallback seed={post.slug} color={color} label={post.title} />
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fog">
        {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
        <span>{post.readingMinutes} min read</span>
        {post.isSample && <SampleBadge />}
      </div>
      <h3 className="mt-2 text-xl font-medium tracking-tight group-hover:text-signal">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="mt-2 line-clamp-3 text-sm text-fog">{post.excerpt}</p>}
      {post.categories.length > 0 && (
        <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
          {post.categories.map((c) => (
            <li key={c._id}>
              <Link href={`/blog/category/${c.slug}`} className="rounded-full border px-2.5 py-0.5 text-xs transition-colors hover:bg-hull-2" style={{ borderColor: `color-mix(in srgb, ${c.color} 45%, transparent)`, color: c.color }}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
