import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { ProjectCardDTO, ProjectDTO, ProjectSection, BlogCardDTO } from "@/lib/content/types";
import { sectionMeta } from "@/lib/content/constants";
import { Markdown } from "@/components/content/markdown";
import { CodeBlock } from "@/components/content/code-block";
import { Gallery } from "@/components/content/gallery";
import { SmartImage } from "@/components/media/smart-image";
import { CoverFallback } from "@/components/media/cover-fallback";
import { GithubMark } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button";
import { Reveal } from "@/components/motion/primitives";
import { Container } from "@/components/site/section-header";
import { ProjectTile, SampleBadge, StateBadge } from "@/components/site/project-card";
import { BlogCard } from "@/components/site/blog-card";
import { CaseStudyNav } from "./case-study-nav";
import { formatDate, hostOf, isSafeHttpUrl } from "@/lib/utils";

/** A section is shown only if enabled and it actually has something to render. */
function hasContent(s: ProjectSection, p: ProjectDTO, related: ProjectCardDTO[]) {
  if (!s.enabled) return false;
  switch (s.type) {
    case "stack":
      return p.technologies.length > 0;
    case "implementation":
      return p.implementationSteps.length > 0;
    case "code":
      return p.codeSnippets.length > 0;
    case "screenshots":
      return p.gallery.length > 0;
    case "diagrams":
      return p.architectureImages.length > 0;
    case "links":
      return isSafeHttpUrl(p.githubUrl) || isSafeHttpUrl(p.demoUrl);
    case "related":
      return related.length > 0;
    default:
      return s.content.trim().length > 0;
  }
}

function SectionBody({ s, p, related }: { s: ProjectSection; p: ProjectDTO; related: ProjectCardDTO[] }) {
  switch (s.type) {
    case "stack":
      return (
        <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {p.technologies.map((t) => (
            <div key={t.name} className="bg-abyss p-4">
              <dt className="font-mono text-sm text-signal">{t.name}</dt>
              {t.role && <dd className="mt-1 text-sm text-fog">{t.role}</dd>}
            </div>
          ))}
        </dl>
      );
    case "implementation":
      return (
        <>
          {s.content && <Markdown source={s.content} className="prose-lab mb-8" />}
          <ol className="relative space-y-8 border-l border-line-strong pl-8">
            {p.implementationSteps.map((st, i) => (
              <li key={i} className="relative">
                <span className="absolute top-0 -left-[45px] grid h-7 w-7 place-items-center rounded-full border border-signal/60 bg-abyss font-mono text-xs text-signal">{i + 1}</span>
                <h3 className="text-lg font-medium">{st.title}</h3>
                {st.body && <Markdown source={st.body} className="prose-lab mt-2" />}
              </li>
            ))}
          </ol>
        </>
      );
    case "code":
      return (
        <>
          {s.content && <Markdown source={s.content} />}
          {p.codeSnippets.map((c, i) => (
            <CodeBlock key={i} code={c.code} language={c.language} title={c.title} caption={c.caption} />
          ))}
        </>
      );
    case "screenshots":
      return (
        <>
          {s.content && <Markdown source={s.content} className="prose-lab mb-6" />}
          <Gallery images={p.gallery} layout="slider" label={`${p.title} screenshots`} />
        </>
      );
    case "diagrams":
      return (
        <>
          {s.content && <Markdown source={s.content} className="prose-lab mb-6" />}
          <Gallery images={p.architectureImages} layout="stack" label={`${p.title} architecture`} />
        </>
      );
    case "links":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {isSafeHttpUrl(p.githubUrl) && (
            <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl border border-line bg-hull/50 p-5 transition-colors hover:border-signal/60">
              <GithubMark className="h-6 w-6" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Source repository</span>
                <span className="block truncate font-mono text-xs text-fog">{p.githubUrl.replace(/^https?:\/\//, "")}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-fog group-hover:text-signal" />
            </a>
          )}
          {isSafeHttpUrl(p.demoUrl) && (
            <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl border border-line bg-hull/50 p-5 transition-colors hover:border-signal/60">
              <ExternalLink className="h-6 w-6" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">Live demo</span>
                <span className="block truncate font-mono text-xs text-fog">{hostOf(p.demoUrl)}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-fog group-hover:text-signal" />
            </a>
          )}
        </div>
      );
    case "related":
      return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((r) => (
            <ProjectTile key={r._id} p={r} />
          ))}
        </div>
      );
    case "architecture":
      return (
        <>
          <Markdown source={s.content} />
          {/* If there's no separate diagrams section, show the diagrams with the architecture text. */}
          {!p.sections.some((x) => x.type === "diagrams" && x.enabled) && p.architectureImages.length > 0 && (
            <div className="mt-8">
              <Gallery images={p.architectureImages} layout="stack" label={`${p.title} architecture`} />
            </div>
          )}
        </>
      );
    default:
      return <Markdown source={s.content} />;
  }
}

export function CaseStudy({ project: p, related, articles = [], preview = false }: { project: ProjectDTO; related: ProjectCardDTO[]; articles?: BlogCardDTO[]; preview?: boolean }) {
  const visible = p.sections.filter((s) => hasContent(s, p, related));
  const navItems = visible.map((s) => ({ id: s.type, title: s.title || sectionMeta(s.type)?.title || s.type }));
  const color = p.category?.color ?? "var(--signal)";

  return (
    <article>
      {preview && (
        <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit rounded-full border border-flare/60 bg-hull px-4 py-2 text-sm shadow-xl">
          Preview · {p.status === "published" ? "published" : "draft, not visible to visitors"} ·{" "}
          <Link href={`/admin/projects/${p._id}/edit`} className="text-signal underline">
            Back to editor
          </Link>
        </div>
      )}
      <header className="relative overflow-hidden pt-32 pb-12 md:pt-40">
        <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-60" style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${color} 22%, transparent), transparent)` }} aria-hidden="true" />
        <Container className="relative">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-fog">
            <Link href="/projects" className="hover:text-frost">
              Projects
            </Link>
            {p.category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/categories/${p.category.slug}`} className="hover:text-frost" style={{ color }}>
                  {p.category.name}
                </Link>
              </>
            )}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <StateBadge state={p.projectState} />
            {p.isSample && <SampleBadge />}
            {p.publishedAt && <span className="text-xs text-fog">Published {formatDate(p.publishedAt, { year: "numeric", month: "long" })}</span>}
          </div>
          <h1 className="mt-4 max-w-4xl text-[2.4rem] leading-[1.04] tracking-tight sm:text-4xl md:text-[4.25rem]" style={{ fontVariationSettings: '"opsz" 96' }}>
            {p.title}
          </h1>
          {p.summary && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fog md:text-xl">{p.summary}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {isSafeHttpUrl(p.githubUrl) && (
              <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "md")}>
                <GithubMark className="h-4 w-4" /> Repository
              </a>
            )}
            {isSafeHttpUrl(p.demoUrl) && (
              <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "md")}>
                Live demo <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {p.technologies.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
              {p.technologies.map((t) => (
                <li key={t.name}>
                  <Link href={`/projects?tech=${encodeURIComponent(t.name)}`} className="block rounded-md border border-line bg-hull/60 px-2.5 py-1 font-mono text-xs text-fog transition-colors hover:border-signal/60 hover:text-signal" title={t.role || undefined}>
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </header>

      <Container>
        <Reveal variant="clip" className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-hull-2 sm:aspect-[21/9]">
          {p.coverImage?.url ? <SmartImage src={p.coverImage.url} alt={p.coverImage.alt || `${p.title} cover image`} fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-contain p-2" /> : <CoverFallback seed={p.slug} color={p.category?.color} label={p.title} />}
        </Reveal>
      </Container>

      {p.systemDesignImage?.url && (
        <Container className="mt-12 md:mt-16">
          <Reveal variant="rise">
            <figure id="system-design" className="scroll-mt-28">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-1 font-mono text-[11px] tracking-[0.2em] text-signal uppercase">System design</p>
                  <h2 className="text-2xl tracking-tight md:text-3xl" style={{ fontVariationSettings: '"opsz" 64' }}>
                    Architecture &amp; flow
                  </h2>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-line bg-hull-2">
                <div className="relative aspect-[16/10] w-full sm:aspect-[21/10]">
                  <SmartImage
                    src={p.systemDesignImage.url}
                    alt={p.systemDesignImage.alt || `${p.title} system design diagram`}
                    fill
                    sizes="(min-width: 1280px) 1216px, 100vw"
                    className="object-contain p-3 sm:p-5"
                  />
                </div>
              </div>
              {p.systemDesignImage.caption && (
                <figcaption className="mt-3 text-center text-sm text-fog">{p.systemDesignImage.caption}</figcaption>
              )}
            </figure>
          </Reveal>
        </Container>
      )}

      <Container className="mt-14 md:mt-20">
        {visible.length === 0 ? (
          <p className="text-fog">The full write-up for this project hasn&apos;t been published yet.</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
            <aside className="min-w-0">
              <CaseStudyNav
                items={[
                  ...(p.systemDesignImage?.url ? [{ id: "system-design", title: "System design" }] : []),
                  ...navItems,
                ]}
              />
            </aside>
            <div className="min-w-0 space-y-20">
              {visible.map((s) => (
                <section key={s.type} id={s.type} className="scroll-mt-28" aria-labelledby={`h-${s.type}`}>
                  <Reveal variant="fade">
                    <h2 id={`h-${s.type}`} className="mb-6 text-2xl tracking-tight md:text-3xl" style={{ fontVariationSettings: '"opsz" 64' }}>
                      {s.title || sectionMeta(s.type)?.title}
                    </h2>
                    <SectionBody s={s} p={p} related={related} />
                  </Reveal>
                </section>
              ))}
              {articles.length > 0 && (
                <section aria-labelledby="h-articles">
                  <h2 id="h-articles" className="mb-6 text-2xl tracking-tight md:text-3xl">
                    Writing about this project
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {articles.map((a) => (
                      <BlogCard key={a._id} post={a} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </Container>
    </article>
  );
}
