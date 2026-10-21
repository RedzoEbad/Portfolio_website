import type { Metadata } from "next";
import { Award, ExternalLink, UserRound } from "lucide-react";
import { getCertifications, getSettings, getSkills, getTimeline } from "@/lib/queries/public";
import { Container, PageIntro } from "@/components/site/section-header";
import { Markdown } from "@/components/content/markdown";
import { SmartImage } from "@/components/media/smart-image";
import { SocialLinks } from "@/components/site/social-links";
import { Timeline } from "@/components/site/timeline";
import { EmptyState } from "@/components/site/empty-state";
import { iconFor } from "@/lib/content/icons";
import { formatDate, isSafeHttpUrl } from "@/lib/utils";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: "About", description: s.about.intro || `About ${s.ownerName}.`, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const [settings, skills, certs, timeline] = await Promise.all([getSettings(), getSkills(), getCertifications(), getTimeline()]);
  const groups = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});
  const hasBio = settings.about.intro || settings.about.body;

  return (
    <>
      <PageIntro title={`About ${settings.ownerName}`} lede={settings.about.intro || settings.role} />
      <Container className="pt-16">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div className="min-w-0">
            {settings.about.body ? (
              <Markdown source={settings.about.body} />
            ) : (
              !hasBio && <EmptyState title="The bio hasn't been written yet" body="It's edited under Settings → About in the admin portal." />
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-hull-2">
              {settings.avatar?.url ? (
                <SmartImage src={settings.avatar.url} alt={settings.avatar.alt || settings.ownerName} fill sizes="320px" className="object-cover" priority />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-line bg-hull text-fog">
                    <UserRound className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium text-frost">Your photo</p>
                  <p className="text-xs text-fog">Add a portrait in Admin → Settings → Profile → Portrait</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-hull/50 p-5">
              <p className="text-lg font-semibold tracking-tight" style={{ fontVariationSettings: '"opsz" 36' }}>
                {settings.ownerName}
              </p>
              {settings.role && <p className="mt-1.5 text-sm text-signal">{settings.role}</p>}
              {settings.location && <p className="mt-1 text-sm text-fog">{settings.location}</p>}
              <SocialLinks settings={settings} className="mt-5" />
            </div>
          </aside>
        </div>

        {Object.keys(groups).length > 0 && (
          <section className="mt-28" aria-labelledby="skills-title">
            <h2 id="skills-title" className="mb-3 text-3xl tracking-tight">
              Skills and tools
            </h2>
            <p className="mb-10 max-w-2xl text-fog">The platforms and tooling I use to design, secure and operate cloud systems.</p>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <h3 className="mb-4 border-b border-line pb-3 text-sm text-fog">{group}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {items.map((s) => {
                      const Icon = s.icon ? iconFor(s.icon) : null;
                      return (
                        <li key={s._id} title={s.note || undefined} className="group inline-flex items-center gap-2 rounded-lg border border-line bg-hull/50 px-3 py-1.5 text-sm transition-colors hover:border-signal/60 hover:text-signal">
                          {Icon && <Icon className="h-3.5 w-3.5 text-fog group-hover:text-signal" aria-hidden="true" />}
                          {s.name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {certs.length > 0 && (
          <section className="mt-28" aria-labelledby="certs-title">
            <h2 id="certs-title" className="mb-10 text-3xl tracking-tight">
              Certifications
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certs.map((c) => (
                <li key={c._id} className="flex gap-4 rounded-2xl border border-line bg-hull/50 p-5">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-abyss">
                    {c.badge?.url ? <SmartImage src={c.badge.url} alt={c.badge.alt || `${c.name} badge`} fill sizes="56px" className="object-contain p-1" /> : <Award className="h-6 w-6 text-[#f5b84a]" aria-hidden="true" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-fog">{[c.issuer, c.issuedAt && formatDate(c.issuedAt, { year: "numeric", month: "short" })].filter(Boolean).join(", ")}</p>
                    {isSafeHttpUrl(c.credentialUrl) && (
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-signal hover:underline">
                        Verify credential <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {timeline.length > 0 && (
          <section className="mt-28" aria-labelledby="timeline-title">
            <h2 id="timeline-title" className="mb-12 text-3xl tracking-tight">
              Timeline
            </h2>
            <Timeline events={timeline} />
          </section>
        )}
      </Container>
    </>
  );
}
