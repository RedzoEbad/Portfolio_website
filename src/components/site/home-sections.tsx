import type { BlogCardDTO, ProjectCardDTO, SettingsDTO, TimelineDTO } from "@/lib/content/types";
import { iconFor } from "@/lib/content/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Container, SectionHeader } from "./section-header";
import { ProjectFeature } from "./project-card";
import { BlogCard } from "./blog-card";
import { EmptyState } from "./empty-state";
import { Timeline } from "./timeline";

export function FeaturedProjects({ projects }: { projects: ProjectCardDTO[] }) {
  return (
    <section className="py-16 sm:py-24 md:py-32" aria-labelledby="featured-title">
      <Container wide>
        <SectionHeader
          id="featured-title"
          index="02 — Work"
          align="split"
          title="Selected systems"
          lede="Case studies past the screenshot — problem, architecture, what broke, what I’d change."
          action={projects.length ? { href: "/projects", label: "Browse all" } : undefined}
        />
        {projects.length === 0 ? (
          <EmptyState command="kubectl get projects --published" title="No projects published yet" body="Case studies appear here as soon as they're published from the admin portal." />
        ) : (
          <div className="space-y-8 md:space-y-12 lg:space-y-16">
            {projects.map((p, i) => (
              <Reveal key={p._id} variant={i % 2 === 0 ? "blur" : "rise"} delay={0.05}>
                <ProjectFeature p={p} flip={i % 2 === 1} priority={i === 0} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export function ImpactSection({ items }: { items: SettingsDTO["impact"] }) {
  if (!items.length) return null;
  return (
    <section className="relative overflow-hidden border-y border-line py-16 sm:py-24 md:py-32" aria-labelledby="impact-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,var(--glow-ion),transparent_55%)] opacity-70" aria-hidden="true" />
      <Container wide className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 xl:gap-24">
          <Reveal variant="rise" className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-signal uppercase">03 — Focus</p>
            <h2 id="impact-title" className="text-[clamp(1.85rem,4vw,3.2rem)] leading-[1.05] tracking-tight" style={{ fontVariationSettings: '"opsz" 72' }}>
              Problems I get pulled into
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-fog sm:text-lg">Where infrastructure, delivery, and reliability meet — the threads that run through the work.</p>
          </Reveal>

          <Stagger gap={0.07} className="space-y-0">
            {items.map((it, i) => {
              const Icon = iconFor(it.icon);
              return (
                <StaggerItem key={it.title + i}>
                  <div className="group grid gap-4 border-t border-line py-8 first:border-t-0 first:pt-0 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-8 sm:py-10">
                    <span className="font-mono text-sm text-signal/70">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <Icon className="h-5 w-5 text-signal transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                        <h3 className="text-lg font-medium tracking-tight sm:text-xl">{it.title}</h3>
                      </div>
                      {it.description && <p className="max-w-xl text-sm leading-relaxed text-fog sm:text-base">{it.description}</p>}
                    </div>
                    {it.metricValue && (
                      <div className="sm:text-right">
                        <p className="text-3xl font-semibold tracking-tight text-frost sm:text-4xl" style={{ fontVariationSettings: '"opsz" 72' }}>
                          {it.metricValue}
                        </p>
                        {it.metricLabel && <p className="mt-1 text-xs text-fog sm:text-sm">{it.metricLabel}</p>}
                      </div>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}

export function JourneySection({ events }: { events: TimelineDTO[] }) {
  return (
    <section id="journey" className="scroll-mt-24 py-16 sm:py-24 md:py-32" aria-labelledby="journey-title">
      <Container>
        <SectionHeader
          id="journey-title"
          index="04 — Path"
          align="split"
          title="Engineering journey"
          lede="Certifications, projects, and the lessons that changed how I build."
          action={events.length ? { href: "/about", label: "More about me" } : undefined}
        />
        {events.length ? (
          <Reveal variant="wipe">
            <Timeline events={events} />
          </Reveal>
        ) : (
          <EmptyState title="The timeline is empty" body="Milestones added in the admin portal show up here in date order." />
        )}
      </Container>
    </section>
  );
}

export function LatestArticles({ posts }: { posts: BlogCardDTO[] }) {
  if (!posts.length) return null;
  return (
    <section className="py-16 sm:py-24 md:py-32" aria-labelledby="articles-title">
      <Container wide>
        <SectionHeader
          id="articles-title"
          index="05 — Notes"
          align="split"
          title="Latest writing"
          lede="What I tried, what failed, and what I’d do again."
          action={{ href: "/blog", label: "All articles" }}
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {posts.map((p, i) => (
            <Reveal key={p._id} variant="scale" delay={i * 0.08}>
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
