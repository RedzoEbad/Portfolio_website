import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CategoryDTO } from "@/lib/content/types";
import { iconFor } from "@/lib/content/icons";
import { Counter, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Container, SectionHeader } from "./section-header";
import { EmptyState } from "./empty-state";

/**
 * Domains read like `kubectl get` output: one row per domain, a status column for
 * project count. Rows scan with a light sweep on hover (a style used nowhere else).
 */
export function DomainsSection({ categories, totalProjects }: { categories: CategoryDTO[]; totalProjects: number }) {
  const shown = categories.filter((c) => c.showOnHome);
  if (!shown.length)
    return (
      <section id="domains" className="scroll-mt-24 py-20 md:py-28" aria-labelledby="domains-title">
        <Container>
          <SectionHeader id="domains-title" title="Engineering domains" />
          <EmptyState title="No domains published yet" body="Engineering domains created in the admin portal appear here, each linking to its projects." />
        </Container>
      </section>
    );
  return (
    <section id="domains" className="scroll-mt-24 py-20 md:py-28" aria-labelledby="domains-title">
      <Container>
        <SectionHeader
          id="domains-title"
          title="Engineering domains"
          lede={
            <>
              <Counter value={shown.length} /> areas I work across, with <Counter value={totalProjects} /> published project{totalProjects === 1 ? "" : "s"} between them.
            </>
          }
          action={{ href: "/projects", label: "All projects" }}
        />

        <div className="overflow-hidden rounded-2xl border border-line bg-hull/40">
          <div className="hidden grid-cols-[2.2rem_1.3fr_2fr_7rem_2rem] gap-4 border-b border-line px-5 py-3 font-mono text-xs text-fog md:grid" aria-hidden="true">
            <span />
            <span>name</span>
            <span>focus</span>
            <span className="text-right">projects</span>
            <span />
          </div>
          <Stagger>
            <ul className="contents">
              {shown.map((c) => {
                const Icon = iconFor(c.icon);
                return (
                  <StaggerItem as="li" key={c._id} className="border-b border-line last:border-b-0">
                      <Link
                        href={`/categories/${c.slug}`}
                        className="group relative grid grid-cols-[2.2rem_1fr_auto] items-center gap-x-4 gap-y-1 overflow-hidden px-5 py-5 transition-colors hover:bg-hull-2/60 md:grid-cols-[2.2rem_1.3fr_2fr_7rem_2rem]"
                        style={{ ["--c" as string]: c.color }}
                      >
                        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--c)_14%,transparent)] to-transparent group-hover:animate-scan" aria-hidden="true" />
                        <span className="grid h-9 w-9 place-items-center rounded-lg border" style={{ borderColor: `color-mix(in srgb, ${c.color} 45%, transparent)`, background: `color-mix(in srgb, ${c.color} 10%, transparent)`, color: c.color }}>
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        <span className="text-lg font-medium tracking-tight">{c.name}</span>
                        <span className="col-start-2 row-start-2 text-sm text-fog md:col-start-3 md:row-start-1">{c.tagline || c.description.slice(0, 120)}</span>
                        <span className="col-start-3 row-start-1 text-right font-mono text-sm md:col-start-4">
                          <span className={c.projectCount ? "text-frost" : "text-fog"}>{c.projectCount ?? 0}</span>
                        </span>
                        <ArrowUpRight className="hidden h-4 w-4 text-fog transition-[transform,color] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--c)] md:block" aria-hidden="true" />
                      </Link>
                  </StaggerItem>
                );
              })}
            </ul>
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
