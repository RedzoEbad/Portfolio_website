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
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 md:pt-32 lg:min-h-[100svh] lg:pb-10" aria-labelledby="hero-title">
      <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute top-[-15%] left-[-10%] h-[min(620px,80vw)] w-[min(620px,80vw)] rounded-full bg-[radial-gradient(closest-side,var(--glow-signal),transparent)] float-soft" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-12%] bottom-[-10%] h-[min(560px,75vw)] w-[min(680px,90vw)] rounded-full bg-[radial-gradient(closest-side,var(--glow-ion),transparent)]" style={{ animation: "float-y 9s ease-in-out infinite reverse" }} aria-hidden="true" />
      <div className="pointer-events-none absolute top-[35%] left-[40%] h-40 w-40 rounded-full bg-[radial-gradient(closest-side,var(--glow-flare),transparent)] opacity-70 sm:h-56 sm:w-56" aria-hidden="true" />

      <Container className="relative grid items-center gap-10 sm:gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <div>
          {hero.statusTone !== "hidden" && hero.statusText && (
            <p className="mb-6 inline-flex max-w-full items-center gap-2.5 rounded-full border border-line-strong bg-hull/90 py-1.5 pr-4 pl-3 text-sm text-fog sm:mb-8">
              <span className={cn("pulse-dot h-2 w-2 shrink-0 rounded-full bg-current", TONE[hero.statusTone])} aria-hidden="true" />
              <span className="truncate">{hero.statusText}</span>
            </p>
          )}
          <HeroHeadline id="hero-title" text={hero.headline} />
          {hero.subheadline && <p className="mt-5 max-w-xl text-base leading-relaxed text-fog sm:mt-7 sm:text-lg md:text-xl">{hero.subheadline}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-2.5 sm:mt-10 sm:gap-3">
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

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <HeroDiagram centerLabel={firstName} />
        </div>
      </Container>
    </section>
  );
}
