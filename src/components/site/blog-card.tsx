import Link from "next/link";
import type { BlogCardDTO } from "@/lib/content/types";
import { SmartImage } from "@/components/media/smart-image";
import { CoverFallback } from "@/components/media/cover-fallback";
import { formatDate } from "@/lib/utils";
import { SampleBadge } from "./project-card";

export function BlogCard({ post }: { post: BlogCardDTO }) {
  const color = post.categories[0]?.color ?? "var(--ion)";
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[5/3] overflow-hidden rounded-[1.15rem] border border-line bg-hull transition-[border-color,transform] duration-500 group-hover:-translate-y-1 group-hover:border-signal/40">
        {post.coverImage?.url ? (
          <SmartImage
            src={post.coverImage.url}
            alt={post.coverImage.alt || ""}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <CoverFallback seed={post.slug} color={color} label={post.title} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-wide text-fog uppercase">
        {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        <span aria-hidden="true" className="h-3 w-px bg-line-strong" />
        <span>{post.readingMinutes} min</span>
        {post.isSample && <SampleBadge />}
      </div>
      <h3 className="mt-2 text-xl font-medium tracking-tight transition-colors group-hover:text-signal sm:text-2xl">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fog">{post.excerpt}</p>}
      {post.categories.length > 0 && (
        <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
          {post.categories.map((c) => (
            <li key={c._id}>
              <Link
                href={`/blog/category/${c.slug}`}
                className="rounded-full border px-2.5 py-0.5 text-xs transition-colors hover:bg-hull-2"
                style={{ borderColor: `color-mix(in srgb, ${c.color} 45%, transparent)`, color: c.color }}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
