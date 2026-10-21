import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { getCategories, getSettings } from "@/lib/queries/public";

/** Public shell revalidates with content; admin mutations call revalidatePublic(). */
export const revalidate = 120;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const links = settings.nav.filter((n) => n.enabled).map(({ label, href }) => ({ label, href }));
  return (
    <>
      <SiteNav siteName={settings.siteName} links={links} githubUrl={settings.socials.github || undefined} domains={categories.map((c) => ({ name: c.name, slug: c.slug, color: c.color }))} />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter settings={settings} categories={categories} />
    </>
  );
}
