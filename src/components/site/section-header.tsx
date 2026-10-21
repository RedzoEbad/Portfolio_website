import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  id,
  index,
  title,
  lede,
  action,
  className,
  align = "start",
}: {
  id?: string;
  index?: string;
  title: string;
  lede?: React.ReactNode;
  action?: { href: string; label: string };
  className?: string;
  align?: "start" | "split";
}) {
  return (
    <div className={cn("mb-10 md:mb-16", align === "split" && "grid gap-6 md:grid-cols-[1fr_auto] md:items-end", className)}>
      <div className={cn(align === "split" ? "max-w-3xl" : "max-w-3xl")}>
        {index && (
          <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-signal uppercase">
            {index}
          </p>
        )}
        <h2 id={id} className="text-[clamp(1.85rem,4.2vw,3.35rem)] leading-[1.05] tracking-tight" style={{ fontVariationSettings: '"opsz" 72' }}>
          {title}
        </h2>
        {lede && <p className="mt-4 max-w-xl text-base leading-relaxed text-fog sm:text-lg">{lede}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex w-fit items-center gap-2 border-b border-signal/40 pb-1 text-sm font-medium text-frost transition-colors hover:border-signal hover:text-signal"
        >
          {action.label}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Container({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", wide ? "max-w-[1400px]" : "max-w-7xl", className)}>{children}</div>;
}

export function PageIntro({ title, lede, children, index }: { title: string; lede?: React.ReactNode; children?: React.ReactNode; index?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-28 pb-12 sm:pt-36 sm:pb-16 md:pt-44 md:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--glow-signal),transparent_55%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" aria-hidden="true" />
      <Container className="relative">
        {index && <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-signal uppercase">{index}</p>}
        <h1 className="max-w-5xl text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.98] tracking-tight" style={{ fontVariationSettings: '"opsz" 96' }}>
          {title}
        </h1>
        {lede && <p className="mt-6 max-w-2xl text-base text-fog sm:text-lg md:text-xl">{lede}</p>}
        {children}
      </Container>
    </section>
  );
}
