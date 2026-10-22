import { adminSettings } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { env } from "@/lib/env";

export const metadata = { title: "Site settings" };

export default async function AdminSettings() {
  const s = await adminSettings();
  const img = (i: { url: string; alt?: string; caption?: string } | null | undefined) => (i?.url ? { url: i.url, alt: i.alt ?? "", caption: i.caption ?? "" } : null);
  const initial = {
    siteName: s.siteName,
    ownerName: s.ownerName,
    role: s.role ?? "",
    location: s.location ?? "",
    avatar: img(s.avatar),
    hero: { headline: s.hero.headline, subheadline: s.hero.subheadline ?? "", statusText: s.hero.statusText ?? "", statusTone: s.hero.statusTone ?? "available" },
    about: { intro: s.about?.intro ?? "", body: s.about?.body ?? "" },
    impact: (s.impact ?? []).map((i) => ({ title: i.title, description: i.description ?? "", icon: i.icon ?? "hexagon", metricValue: i.metricValue ?? "", metricLabel: i.metricLabel ?? "" })),
    spotlight: {
      title: s.spotlight?.title || "Snapshots",
      lede: s.spotlight?.lede ?? "LinkedIn moments, screenshots, and bits of the journey worth keeping visible.",
      images: (s.spotlight?.images ?? []).map((g) => ({ url: g.url, alt: g.alt ?? "", caption: g.caption ?? "" })),
    },
    socials: { github: s.socials?.github ?? "", linkedin: s.socials?.linkedin ?? "", x: s.socials?.x ?? "", website: s.socials?.website ?? "" },
    contact: { email: s.contact?.email ?? "", showEmail: !!s.contact?.showEmail, formEnabled: s.contact?.formEnabled !== false, note: s.contact?.note ?? "" },
    nav: (s.nav ?? []).map((n) => ({ label: n.label, href: n.href, enabled: n.enabled !== false })),
    home: {
      showDomains: s.home?.showDomains !== false,
      showFeatured: s.home?.showFeatured !== false,
      showImpact: s.home?.showImpact !== false,
      showTimeline: s.home?.showTimeline !== false,
      showArticles: s.home?.showArticles !== false,
      showSpotlight: s.home?.showSpotlight !== false,
      showContact: s.home?.showContact !== false,
      featuredLimit: s.home?.featuredLimit ?? 4,
      articlesLimit: s.home?.articlesLimit ?? 3,
    },
    seo: { title: s.seo?.title ?? "", description: s.seo?.description ?? "", ogImage: s.seo?.ogImage ?? "", keywords: s.seo?.keywords ?? [] },
    footerNote: s.footerNote ?? "",
  };
  return (
    <>
      <AdminHeader title="Site settings" description="Your profile, homepage content, social links, navigation and SEO defaults. Saved changes go live immediately." />
      <SettingsForm initial={initial} uploadsEnabled={!!env.cloudinary} />
    </>
  );
}
