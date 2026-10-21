import type { BlogCardDTO, ProjectCardDTO, SettingsDTO, TimelineDTO } from "@/lib/content/types";
import { iconFor } from "@/lib/content/icons";
import { Reveal } from "@/components/motion/primitives";
import { Container, SectionHeader } from "./section-header";
import { ProjectFeature } from "./project-card";
import { BlogCard } from "./blog-card";
import { EmptyState } from "./empty-state";
import { Timeline } from "./timeline";

export function FeaturedProjects({ projects }: { projects: ProjectCardDTO[] }) {
  return (
    <section className="py-20 md:py-28" aria-labelledby="featured-title">
      <Container>
        <SectionHeader id="featured-title" title="Selected work" lede="Case studies that go past the screenshot: the problem, the architecture, what broke, and what I'd change." action={projects.length ? { href: "/projects", label: "Browse all projects" } : undefined} />
        {projects.length === 0 ? (
          <EmptyState command="kubectl get projects --published" title="No projects published yet" body="Case studies appear here as soon as they're published from the admin portal." />
        ) : (
          <div className="space-y-24 md:space-y-32">
            {projects.map((p, i) => (
              <Reveal key={p._id} variant="rise">
                <ProjectFeature p={p} flip={i % 2 === 1} priority={i === 0} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/** Problems I work on. Metrics render only when the owner has entered a real value. */
export function ImpactSection({ items }: { items: SettingsDTO["impact"] }) {
  if (!items.length) return null;
  return (
    <section className="relative border-y border-line bg-hull/40 py-20 md:py-28" aria-labelledby="impact-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="impact-title" className="text-3xl tracking-tight md:text-4xl" style={{ fontVariationSettings: '"opsz" 72' }}>
              The problems I get pulled into
            </h2>
            <p className="mt-4 max-w-md text-lg text-fog">Most of my work sits where infrastructure, delivery and reliability meet. These are the threads that run through it.</p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {items.map((it, i) => {
              const Icon = iconFor(it.icon);
              return (
                <Reveal key={it.title + i} variant="fade" delay={(i % 2) * 0.08} className={`flex flex-col bg-abyss p-6 md:p-7 ${items.length % 2 === 1 && i === items.length - 1 ? "sm:col-span-2" : ""}`}>
                  <Icon className="h-5 w-5 text-signal" aria-hidden="true" />
                  <dt className="mt-5 text-lg font-medium tracking-tight">{it.title}</dt>
                  {it.description && <dd className="mt-2 text-sm text-fog">{it.description}</dd>}
                  {it.metricValue && (
                    <dd className="mt-6 flex items-baseline gap-2 border-t border-line pt-4">
                      <span className="text-3xl font-semibold tracking-tight text-frost" style={{ fontVariationSettings: '"opsz" 72' }}>
                        {it.metricValue}
                      </span>
                      {it.metricLabel && <span className="text-sm text-fog">{it.metricLabel}</span>}
                    </dd>
                  )}
                </Reveal>
              );
            })}
          </dl>
        </div>
      </Container>
    </section>
  );
}

export function JourneySection({ events }: { events: TimelineDTO[] }) {
  return (
    <section id="journey" className="scroll-mt-24 py-20 md:py-28" aria-labelledby="journey-title">
      <Container>
        <SectionHeader id="journey-title" title="Engineering journey" lede="Certifications, projects, and the lessons that changed how I build." action={events.length ? { href: "/about", label: "More about me" } : undefined} />
        {events.length ? <Timeline events={events} /> : <EmptyState title="The timeline is empty" body="Milestones added in the admin portal show up here in date order." />}
      </Container>
    </section>
  );
}

export function LatestArticles({ posts }: { posts: BlogCardDTO[] }) {
  if (!posts.length) return null;
  return (
    <section className="py-20 md:py-28" aria-labelledby="articles-title">
      <Container>
        <SectionHeader id="articles-title" title="Latest writing" lede="Notes from the work: what I tried, what failed, and what I'd do again." action={{ href: "/blog", label: "All articles" }} />
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p._id} delay={i * 0.07}>
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
