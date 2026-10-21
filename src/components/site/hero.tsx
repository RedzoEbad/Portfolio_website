import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import type { SettingsDTO } from "@/lib/content/types";
import { buttonClass } from "@/components/ui/button";
import { GithubMark } from "@/components/ui/brand-icons";
import { HeroDiagram } from "./hero-diagram";
import { HeroHeadline } from "./hero-headline";
import { Container } from "./section-header";
import { cn, isSafeHttpUrl } from "@/lib/utils";

const TONE: Record<string, string> = { available: "text-[#2dd4bf]", busy: "text-[#f5b84a]", learning: "text-ion", hidden: "" };

export function Hero({ settings }: { settings: SettingsDTO }) {
  const { hero } = settings;
  const github = isSafeHttpUrl(settings.socials.github) ? settings.socials.github : null;
  const firstName = settings.ownerName.split(/\s+/)[0] || settings.siteName;
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-32 lg:min-h-[100svh] lg:pb-10" aria-labelledby="hero-title">
      <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute top-[-15%] left-[-10%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(closest-side,var(--glow-signal),transparent)]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-12%] bottom-[-10%] h-[560px] w-[680px] rounded-full bg-[radial-gradient(closest-side,var(--glow-ion),transparent)]" aria-hidden="true" />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <div>
          {hero.statusTone !== "hidden" && hero.statusText && (
            <p className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-hull/90 py-1.5 pr-4 pl-3 text-sm text-fog">
              <span className={cn("pulse-dot h-2 w-2 rounded-full bg-current", TONE[hero.statusTone])} aria-hidden="true" />
              {hero.statusText}
            </p>
          )}
          <HeroHeadline id="hero-title" text={hero.headline} />
          {hero.subheadline && <p className="mt-7 max-w-xl text-lg leading-relaxed text-fog md:text-xl">{hero.subheadline}</p>}

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/projects" className={buttonClass("primary", "lg")}>
              Explore my projects
            </Link>
            <Link href="/#journey" className={buttonClass("secondary", "lg")}>
              My engineering journey
              <ArrowDownRight className="h-4 w-4" />
            </Link>
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "lg")}>
                <GithubMark className="h-4 w-4" />
                Visit GitHub
              </a>
            )}
          </div>
        </div>

        <div className="relative">
          <HeroDiagram centerLabel={firstName} />
        </div>
      </Container>
    </section>
  );
}
