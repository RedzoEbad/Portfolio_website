import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import type { SettingsDTO } from "@/lib/content/types";
import { buttonClass } from "@/components/ui/button";
import { GithubMark } from "@/components/ui/brand-icons";
import { HeroDiagram } from "./hero-diagram";
import { Container } from "./section-header";
import { cn, isSafeHttpUrl } from "@/lib/utils";

const TONE: Record<string, string> = { available: "text-[#2dd4bf]", busy: "text-[#f5b84a]", learning: "text-ion", hidden: "" };

/** Server-rendered hero — no scroll-tied client motion on the first paint. */
export function Hero({ settings }: { settings: SettingsDTO }) {
  const { hero } = settings;
  const github = isSafeHttpUrl(settings.socials.github) ? settings.socials.github : null;
  const firstName = settings.ownerName.split(/\s+/)[0] || settings.siteName;
  const brand = settings.ownerName || settings.siteName;
  const lines = hero.headline.match(/[^.!?]+[.!?]?/g)?.map((l) => l.trim()).filter(Boolean) ?? [hero.headline];

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pb-20" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_8%_-5%,var(--glow-signal),transparent_55%),radial-gradient(ellipse_80%_60%_at_95%_35%,var(--glow-ion),transparent_58%)]" />
        <div className="bg-grid absolute inset-0 opacity-30 mask-fade" />
      </div>

      <Container wide className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-center gap-10 lg:gap-14">
        <p className="font-semibold tracking-tight text-signal" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", fontVariationSettings: '"opsz" 28' }}>
          {brand}
        </p>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6 xl:gap-10">
          <div className="min-w-0">
            {hero.statusTone !== "hidden" && hero.statusText && (
              <p className="mb-6 inline-flex max-w-full items-center gap-2.5 border-l-2 border-signal pl-3 text-sm text-fog">
                <span className={cn("pulse-dot h-2 w-2 shrink-0 rounded-full bg-current", TONE[hero.statusTone])} aria-hidden="true" />
                <span className="truncate">{hero.statusText}</span>
              </p>
            )}

            <h1 id="hero-title" className="max-w-[14ch] text-[clamp(2.6rem,8.2vw,6.4rem)] leading-[0.92] font-semibold tracking-[-0.035em]" style={{ fontVariationSettings: '"opsz" 96' }}>
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {hero.subheadline && <p className="mt-7 max-w-md text-base leading-relaxed text-fog sm:mt-8 sm:text-lg">{hero.subheadline}</p>}

            <div className="mt-9 flex flex-wrap items-center gap-3 sm:mt-11">
              <Link href="/projects" className={buttonClass("primary", "lg")}>
                Explore my projects
              </Link>
              <Link href="/#journey" className={buttonClass("secondary", "lg")}>
                Journey
                <ArrowDownRight className="h-4 w-4" />
              </Link>
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "lg")}>
                  <GithubMark className="h-4 w-4" />
                  GitHub
                </a>
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md -translate-y-4 sm:-translate-y-6 lg:mx-0 lg:max-w-none lg:-translate-y-10 xl:-translate-y-14">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(closest-side,var(--glow-signal),transparent)] opacity-45 sm:-inset-12" aria-hidden="true" />
            <div className="relative">
              <HeroDiagram centerLabel={firstName} />
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line/80 pt-6 font-mono text-[11px] tracking-wider text-fog uppercase">
          <span>Scroll</span>
          <span className="hidden h-px flex-1 bg-gradient-to-r from-line-strong to-transparent sm:block" aria-hidden="true" />
          <span className="text-signal">Systems · Delivery · Reliability</span>
        </div>
      </Container>
    </section>
  );
}
