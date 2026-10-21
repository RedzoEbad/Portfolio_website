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
    <SmartImage
      src={p.coverImage.url}
      alt={p.coverImage.alt || `${p.title} cover`}
      fill
      sizes={sizes}
      priority={priority}
      className="object-contain p-2 transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03] sm:p-3"
    />
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
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-fog uppercase">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
    </span>
  );
}

export function SampleBadge() {
  return <span className="rounded-md border border-dashed border-flare/60 px-2 py-0.5 text-[11px] text-flare">Sample</span>;
}

function TechList({ items, max = 5 }: { items: { name: string }[]; max?: number }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {items.slice(0, max).map((t) => (
        <li key={t.name} className="rounded-md border border-line bg-abyss/50 px-2 py-0.5 font-mono text-[11px] text-fog">
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
        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-line text-fog transition-colors hover:border-signal/50 hover:text-frost" aria-label={`${p.title} repository on GitHub`}>
          <GithubMark className="h-4 w-4" />
        </a>
      )}
      {isSafeHttpUrl(p.demoUrl) && (
        <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-line text-fog transition-colors hover:border-signal/50 hover:text-frost" aria-label={`${p.title} live demo`}>
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

/** Cinematic featured band — media full-bleed with overlapping copy. */
export function ProjectFeature({ p, flip = false, priority, index }: { p: ProjectCardDTO; flip?: boolean; priority?: boolean; index?: number }) {
  const n = index != null ? String(index + 1).padStart(2, "0") : null;
  return (
    <article className="group relative">
      <div className={cn("grid items-stretch gap-0 lg:grid-cols-12 lg:gap-0", flip && "lg:[&>*:first-child]:order-2")}>
        <div className="relative aspect-[16/11] overflow-hidden bg-hull-2 lg:col-span-8 lg:aspect-auto lg:min-h-[28rem] xl:min-h-[32rem]">
          <Cover p={p} sizes="(min-width: 1024px) 66vw, 100vw" priority={priority} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abyss via-abyss/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-abyss/80" aria-hidden="true" />
          {n && (
            <span className="absolute top-5 left-5 font-mono text-4xl font-semibold text-frost/15 sm:text-5xl" aria-hidden="true">
              {n}
            </span>
          )}
        </div>

        <div className="relative flex flex-col justify-end border border-t-0 border-line bg-hull/80 p-6 sm:p-8 lg:col-span-4 lg:border-t lg:border-l-0 lg:p-9 xl:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {p.featured && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-signal uppercase">
                <Star className="h-3 w-3 fill-signal" aria-hidden="true" /> Featured
              </span>
            )}
            {p.category && (
              <Link href={`/categories/${p.category.slug}`} className="relative z-10 text-sm font-medium hover:underline" style={{ color: p.category.color }}>
                {p.category.name}
              </Link>
            )}
            <StateBadge state={p.projectState} />
            {p.isSample && <SampleBadge />}
          </div>

          <h3 className="text-[clamp(1.45rem,2.4vw,2.15rem)] leading-[1.1] tracking-tight" style={{ fontVariationSettings: '"opsz" 64' }}>
            <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {p.title}
            </Link>
          </h3>
          {p.summary && <p className="mt-4 text-sm leading-relaxed text-fog sm:text-base">{p.summary}</p>}
          <div className="mt-6">
            <TechList items={p.technologies} max={5} />
          </div>
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-frost transition-colors group-hover:text-signal">
              {p.hasCaseStudy ? (
                <>
                  <BookOpen className="h-4 w-4" aria-hidden="true" /> Case study
                </>
              ) : (
                "View project"
              )}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
            <ExternalLinks p={p} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Compact tile for grids / related. */
export function ProjectTile({ p }: { p: ProjectCardDTO }) {
  return (
    <PointerGlow className="group h-full overflow-hidden rounded-[1.25rem] border border-line bg-hull/40 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-signal/40">
      <article className="relative flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-hull-2">
          <Cover p={p} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
          {p.featured && (
            <span className="absolute top-3 left-3 grid h-8 w-8 place-items-center rounded-full border border-line bg-abyss/70" title="Featured">
              <Star className="h-3.5 w-3.5 fill-signal text-signal" aria-label="Featured" />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {p.category && (
              <span className="text-xs font-medium" style={{ color: p.category.color }}>
                {p.category.name}
              </span>
            )}
            <StateBadge state={p.projectState} />
          </div>
          <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
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
