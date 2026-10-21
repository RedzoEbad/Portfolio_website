"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowDownRight } from "lucide-react";
import type { SettingsDTO } from "@/lib/content/types";
import { buttonClass } from "@/components/ui/button";
import { GithubMark } from "@/components/ui/brand-icons";
import { Magnetic } from "@/components/motion/primitives";
import { HeroDiagram } from "./hero-diagram";
import { Container } from "./section-header";
import { cn, isSafeHttpUrl } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/hooks";

const TONE: Record<string, string> = { available: "text-[#2dd4bf]", busy: "text-[#f5b84a]", learning: "text-ion", hidden: "" };

export function Hero({ settings }: { settings: SettingsDTO }) {
  const { hero } = settings;
  const github = isSafeHttpUrl(settings.socials.github) ? settings.socials.github : null;
  const firstName = settings.ownerName.split(/\s+/)[0] || settings.siteName;
  const brand = settings.ownerName || settings.siteName;
  const reduce = useSafeReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pb-20" aria-labelledby="hero-title">
      {/* Full-bleed atmospheric plane */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_10%_-10%,var(--glow-signal),transparent_50%),radial-gradient(ellipse_90%_70%_at_95%_40%,var(--glow-ion),transparent_55%),radial-gradient(ellipse_60%_50%_at_50%_100%,var(--glow-flare),transparent_60%)]" />
        <div className="bg-grid absolute inset-0 opacity-40 mask-fade" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/50 to-transparent" />
      </div>

      <Container wide className="relative flex min-h-[calc(100svh-5rem)] flex-col justify-center gap-10 lg:gap-14">
        {/* Brand as hero-level signal */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-semibold tracking-tight text-signal"
          style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", fontVariationSettings: '"opsz" 28' }}
        >
          {brand}
        </motion.p>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6 xl:gap-10">
          <div className="min-w-0">
            {hero.statusTone !== "hidden" && hero.statusText && (
              <motion.p
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12, duration: 0.5 }}
                className="mb-6 inline-flex max-w-full items-center gap-2.5 border-l-2 border-signal pl-3 text-sm text-fog"
              >
                <span className={cn("pulse-dot h-2 w-2 shrink-0 rounded-full bg-current", TONE[hero.statusTone])} aria-hidden="true" />
                <span className="truncate">{hero.statusText}</span>
              </motion.p>
            )}

            <h1
              id="hero-title"
              className="max-w-[14ch] text-[clamp(2.6rem,8.2vw,6.4rem)] leading-[0.92] font-semibold tracking-[-0.035em]"
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              {(hero.headline.match(/[^.!?]+[.!?]?/g)?.map((l) => l.trim()).filter(Boolean) ?? [hero.headline]).map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.18 + i * 0.12, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            {hero.subheadline && (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.55 }}
                className="mt-7 max-w-md text-base leading-relaxed text-fog sm:mt-8 sm:text-lg"
              >
                {hero.subheadline}
              </motion.p>
            )}

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.5 }}
              className="mt-9 flex flex-wrap items-center gap-3 sm:mt-11"
            >
              <Magnetic>
                <Link href="/projects" className={buttonClass("primary", "lg")}>
                  Explore my projects
                </Link>
              </Magnetic>
              <Magnetic strength={0.18}>
                <Link href="/#journey" className={buttonClass("secondary", "lg")}>
                  Journey
                  <ArrowDownRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost", "lg")}>
                  <GithubMark className="h-4 w-4" />
                  GitHub
                </a>
              )}
            </motion.div>
          </div>

          {/* Dominant visual — offset, not a card */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md -translate-y-4 sm:-translate-y-6 lg:mx-0 lg:max-w-none lg:-translate-y-10 xl:-translate-y-14"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,var(--glow-signal),transparent)] opacity-60 blur-2xl sm:-inset-10" aria-hidden="true" />
            <div className="relative">
              <HeroDiagram centerLabel={firstName} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-auto flex items-center justify-between gap-4 border-t border-line/80 pt-6 font-mono text-[11px] tracking-wider text-fog uppercase"
        >
          <span>Scroll</span>
          <span className="hidden h-px flex-1 bg-gradient-to-r from-line-strong to-transparent sm:block" aria-hidden="true" />
          <span className="text-signal">Systems · Delivery · Reliability</span>
        </motion.div>
      </Container>
    </section>
  );
}
