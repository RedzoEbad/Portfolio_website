import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategoryDTO } from "@/lib/content/types";
import { iconFor } from "@/lib/content/icons";
import { Counter, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Container, SectionHeader } from "./section-header";
import { EmptyState } from "./empty-state";

/** Large asymmetric domain tiles — not a table. */
export function DomainsSection({ categories, totalProjects }: { categories: CategoryDTO[]; totalProjects: number }) {
  const shown = categories.filter((c) => c.showOnHome);
  if (!shown.length)
    return (
      <section id="domains" className="scroll-mt-24 py-16 sm:py-24 md:py-32" aria-labelledby="domains-title">
        <Container>
          <SectionHeader id="domains-title" index="01 — Domains" title="Engineering domains" />
          <EmptyState title="No domains published yet" body="Engineering domains created in the admin portal appear here, each linking to its projects." />
        </Container>
      </section>
    );

  return (
    <section id="domains" className="scroll-mt-24 py-16 sm:py-24 md:py-32" aria-labelledby="domains-title">
      <Container wide>
        <SectionHeader
          id="domains-title"
          index="01 — Domains"
          align="split"
          title="Where I build"
          lede={
            <>
              <Counter value={shown.length} /> focus areas · <Counter value={totalProjects} /> published project{totalProjects === 1 ? "" : "s"}
            </>
          }
          action={{ href: "/projects", label: "All projects" }}
        />

        <Stagger gap={0.08} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          {shown.map((c, i) => {
            const Icon = iconFor(c.icon);
            const span =
              shown.length === 1
                ? "lg:col-span-12"
                : i === 0
                  ? "lg:col-span-7"
                  : i === 1
                    ? "lg:col-span-5"
                    : i % 3 === 2
                      ? "lg:col-span-4"
                      : "lg:col-span-4";
            return (
              <StaggerItem key={c._id} className={span}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="group relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-[1.35rem] border border-line bg-hull/50 p-6 transition-[border-color,transform,background] duration-500 hover:-translate-y-1 hover:border-signal/45 hover:bg-hull sm:min-h-[13rem] sm:p-7"
                  style={{ ["--c" as string]: c.color }}
                >
                  <span
                    className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${c.color} 35%, transparent), transparent)` }}
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-2xl border"
                      style={{
                        borderColor: `color-mix(in srgb, ${c.color} 45%, transparent)`,
                        background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                        color: c.color,
                      }}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-fog transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--c)]" />
                  </div>
                  <div className="relative mt-8">
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{c.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-fog">{c.tagline || c.description}</p>
                    <p className="mt-4 font-mono text-xs text-fog">
                      <span className="text-frost">{c.projectCount ?? 0}</span> projects
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
