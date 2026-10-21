import Link from "next/link";
import type { BlogPostDTO, ProjectCardDTO } from "@/lib/content/types";
import { Markdown } from "@/components/content/markdown";
import { SmartImage } from "@/components/media/smart-image";
import { Container } from "./section-header";
import { ProjectTile, SampleBadge } from "./project-card";
import { ReadingProgress } from "./reading-progress";
import { formatDate } from "@/lib/utils";

export function Article({ post, projects, preview = false }: { post: BlogPostDTO; projects: ProjectCardDTO[]; preview?: boolean }) {
  const scheduled = post.status === "published" && post.publishedAt && new Date(post.publishedAt) > new Date();
  return (
    <article>
      <ReadingProgress />
      {preview && (
        <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit rounded-full border border-flare/60 bg-hull px-4 py-2 text-sm shadow-xl">
          Preview · {scheduled ? "scheduled" : post.status === "published" ? "published" : "draft, not visible to visitors"} ·{" "}
          <Link href={`/admin/blog/${post._id}/edit`} className="text-signal underline">
            Back to editor
          </Link>
        </div>
      )}
      <header className="relative pt-32 pb-10 md:pt-40">
        <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-fog">
            <Link href="/blog" className="hover:text-frost">
              Blog
            </Link>
            {post.categories[0] && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/blog/category/${post.categories[0].slug}`} style={{ color: post.categories[0].color }} className="hover:underline">
                  {post.categories[0].name}
                </Link>
              </>
            )}
          </nav>
          <h1 className="text-[2.2rem] leading-[1.06] tracking-tight sm:text-4xl md:text-5xl" style={{ fontVariationSettings: '"opsz" 96' }}>
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-fog">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fog">
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, { year: "numeric", month: "long", day: "numeric" })}</time>}
            <span>{post.readingMinutes} min read</span>
            {post.isSample && <SampleBadge />}
          </div>
        </Container>
      </header>
      {post.coverImage?.url && (
        <Container className="max-w-5xl">
          <figure>
            <div className="relative aspect-[2/1] overflow-hidden rounded-2xl border border-line">
              <SmartImage src={post.coverImage.url} alt={post.coverImage.alt || ""} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
            {post.coverImage.caption && <figcaption className="mt-2 text-center text-sm text-fog">{post.coverImage.caption}</figcaption>}
          </figure>
        </Container>
      )}
      <Container className="mt-12 max-w-3xl">
        <Markdown source={post.content} className="prose-lab text-[1.075rem]" />
        {post.tags.length > 0 && (
          <ul className="mt-14 flex flex-wrap gap-2 border-t border-line pt-8" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t}>
                <Link href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-fog hover:text-frost">
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
      {projects.length > 0 && (
        <Container className="mt-20">
          <h2 className="mb-6 text-2xl tracking-tight">Related projects</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p._id}>
                <ProjectTile p={p} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </article>
  );
}
