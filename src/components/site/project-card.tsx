import Link from "next/link";
import { ArrowUpRight, BookOpen, ExternalLink, Star } from "lucide-react";
import type { ProjectCardDTO } from "@/lib/content/types";
import { PROJECT_STATE_LABEL } from "@/lib/content/constants";
import { SmartImage } from "@/components/media/smart-image";
import { CoverFallback } from "@/components/media/cover-fallback";
import { GithubMark } from "@/components/ui/brand-icons";
import { PointerGlow } from "@/components/motion/primitives";
import { cn, isSafeHttpUrl } from "@/lib/utils";

function Cover({ p, sizes, priority }: { p: ProjectCardDTO; sizes: string; priority?: boolean }) {
  return p.coverImage?.url ? (
    <SmartImage src={p.coverImage.url} alt={p.coverImage.alt || `${p.title} cover`} fill sizes={sizes} priority={priority} className="object-contain p-1 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.02]" />
  ) : (
    <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]">
      <CoverFallback seed={p.slug} color={p.category?.color} label={p.title} />
    </div>
  );
}

export function StateBadge({ state }: { state: string }) {
  const label = PROJECT_STATE_LABEL[state as keyof typeof PROJECT_STATE_LABEL] ?? state;
  const tone = state === "in-progress" ? "#f5b84a" : state === "archived" ? "var(--fog)" : state === "experimental" ? "var(--ion)" : "#2dd4bf";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fog">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
    </span>
  );
}

export function SampleBadge() {
  return <span className="rounded-md border border-dashed border-flare/60 px-2 py-0.5 text-[11px] text-flare">Sample content</span>;
}

function TechList({ items, max = 5 }: { items: { name: string }[]; max?: number }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {items.slice(0, max).map((t) => (
        <li key={t.name} className="rounded-md border border-line bg-abyss/40 px-2 py-0.5 font-mono text-[11px] text-fog">
          {t.name}
        </li>
      ))}
      {items.length > max && <li className="px-1 py-0.5 font-mono text-[11px] text-fog">+{items.length - max}</li>}
    </ul>
  );
}

function ExternalLinks({ p }: { p: ProjectCardDTO }) {
  return (
    <div className="relative z-10 flex items-center gap-1">
      {isSafeHttpUrl(p.githubUrl) && (
        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-md text-fog hover:bg-hull-2 hover:text-frost" aria-label={`${p.title} repository on GitHub`}>
          <GithubMark className="h-4 w-4" />
        </a>
      )}
      {isSafeHttpUrl(p.demoUrl) && (
        <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-md text-fog hover:bg-hull-2 hover:text-frost" aria-label={`${p.title} live demo`}>
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/** Large editorial row used for featured work and the list view. */
export function ProjectFeature({ p, flip = false, priority }: { p: ProjectCardDTO; flip?: boolean; priority?: boolean }) {
  return (
    <article className="group relative grid items-center gap-8 md:grid-cols-12 md:gap-10">
      <div className={cn("relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-hull-2 md:col-span-7", flip && "md:order-2")}>
        <Cover p={p} sizes="(min-width: 768px) 58vw, 100vw" priority={priority} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss/50 via-transparent to-transparent" aria-hidden="true" />
        {p.featured && (
          <span className="glass absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-frost">
            <Star className="h-3 w-3 fill-signal text-signal" aria-hidden="true" /> Featured
          </span>
        )}
      </div>
      <div className={cn("md:col-span-5", flip && "md:order-1")}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {p.category && (
            <Link href={`/categories/${p.category.slug}`} className="relative z-10 text-sm font-medium hover:underline" style={{ color: p.category.color }}>
              {p.category.name}
            </Link>
          )}
          <StateBadge state={p.projectState} />
          {p.isSample && <SampleBadge />}
        </div>
        <h3 className="text-2xl tracking-tight md:text-3xl" style={{ fontVariationSettings: '"opsz" 64' }}>
          <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {p.title}
          </Link>
        </h3>
        {p.summary && <p className="mt-4 text-fog">{p.summary}</p>}
        <div className="mt-6">
          <TechList items={p.technologies} max={6} />
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-frost group-hover:text-signal">
            {p.hasCaseStudy ? (
              <>
                <BookOpen className="h-4 w-4" aria-hidden="true" /> Read the case study
              </>
            ) : (
              "View project"
            )}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
          <ExternalLinks p={p} />
        </div>
      </div>
    </article>
  );
}

/** Compact tile for the grid view and related projects. */
export function ProjectTile({ p }: { p: ProjectCardDTO }) {
  return (
    <PointerGlow className="group h-full rounded-2xl border border-line bg-hull/60 transition-colors hover:border-line-strong">
      <article className="relative flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl border-b border-line bg-hull-2">
          <Cover p={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          {p.featured && (
            <span className="glass absolute top-3 left-3 grid h-7 w-7 place-items-center rounded-full" title="Featured">
              <Star className="h-3.5 w-3.5 fill-signal text-signal" aria-label="Featured" />
            </span>
          )}
          {p.hasCaseStudy && <span className="glass absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] text-frost">Case study</span>}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {p.category && (
              <span className="text-xs font-medium" style={{ color: p.category.color }}>
                {p.category.name}
              </span>
            )}
            <StateBadge state={p.projectState} />
            {p.isSample && <SampleBadge />}
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {p.title}
            </Link>
          </h3>
          {p.summary && <p className="mt-2 line-clamp-3 text-sm text-fog">{p.summary}</p>}
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <TechList items={p.technologies} max={3} />
            <ExternalLinks p={p} />
          </div>
        </div>
      </article>
    </PointerGlow>
  );
}
