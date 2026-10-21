import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({ id, title, lede, action, className }: { id?: string; title: string; lede?: React.ReactNode; action?: { href: string; label: string }; className?: string }) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4 sm:gap-6 md:mb-14", className)}>
      <div className="max-w-2xl">
        <h2 id={id} className="text-2xl tracking-tight sm:text-3xl md:text-4xl" style={{ fontVariationSettings: '"opsz" 72' }}>
          {title}
        </h2>
        {lede && <p className="mt-3 text-base text-fog sm:mt-4 sm:text-lg">{lede}</p>}
      </div>
      {action && (
        <Link href={action.href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-frost hover:text-signal">
          {action.label}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function PageIntro({ title, lede, children }: { title: string; lede?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-28 pb-12 sm:pt-32 sm:pb-14 md:pt-40 md:pb-16">
      <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[min(420px,55vw)] w-[min(620px,80vw)] rounded-full bg-[radial-gradient(closest-side,var(--glow-ion),transparent)] float-soft" aria-hidden="true" />
      <Container className="relative">
        <h1 className="max-w-4xl text-[2.1rem] leading-[1.04] tracking-tight sm:text-4xl md:text-5xl" style={{ fontVariationSettings: '"opsz" 96' }}>
          {title}
        </h1>
        {lede && <p className="mt-4 max-w-2xl text-base text-fog sm:mt-5 sm:text-lg">{lede}</p>}
        {children}
      </Container>
    </section>
  );
}
