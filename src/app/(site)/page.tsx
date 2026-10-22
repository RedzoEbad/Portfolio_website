import { Hero } from "@/components/site/hero";
import { DomainsSection } from "@/components/site/domains-section";
import { FeaturedProjects, ImpactSection, JourneySection, LatestArticles } from "@/components/site/home-sections";
import { SpotlightSection } from "@/components/site/spotlight-section";
import { ContactSection } from "@/components/site/contact-section";
import { countPublished, getCategories, getFeaturedProjects, getLatestPosts, getSettings, getTimeline } from "@/lib/queries/public";
import { siteUrl } from "@/lib/env";

export const revalidate = 120;

export default async function HomePage() {
  // Kick off independent work immediately; settings only gates conditional queries.
  const settingsP = getSettings();
  const categoriesP = getCategories();
  const countsP = countPublished();
  const settings = await settingsP;
  const h = settings.home;
  const [categories, featured, posts, timeline, counts] = await Promise.all([
    categoriesP,
    h.showFeatured ? getFeaturedProjects(h.featuredLimit) : Promise.resolve([]),
    h.showArticles ? getLatestPosts(h.articlesLimit) : Promise.resolve([]),
    h.showTimeline ? getTimeline() : Promise.resolve([]),
    countsP,
  ]);

  const sameAs = Object.values(settings.socials).filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.ownerName,
    jobTitle: settings.role || undefined,
    url: siteUrl(),
    sameAs: sameAs.length ? sameAs : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero settings={settings} />
      {h.showDomains && <DomainsSection categories={categories} totalProjects={counts.projects} />}
      {h.showFeatured && <FeaturedProjects projects={featured} />}
      {h.showImpact && <ImpactSection items={settings.impact} />}
      {h.showTimeline && <JourneySection events={timeline.slice(0, 12)} />}
      {h.showArticles && <LatestArticles posts={posts} />}
      {h.showSpotlight && settings.spotlight?.images?.length ? (
        <SpotlightSection title={settings.spotlight.title} lede={settings.spotlight.lede} images={settings.spotlight.images} />
      ) : null}
      {h.showContact && <ContactSection settings={settings} />}
    </>
  );
}
