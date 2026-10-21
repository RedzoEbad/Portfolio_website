import Link from "next/link";
import type { CategoryDTO, SettingsDTO } from "@/lib/content/types";
import { SocialLinks } from "./social-links";

/** A quiet telemetry trace runs along the top edge (CSS only, paused for reduced motion). */
function Trace() {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="h-12 w-full text-signal" aria-hidden="true">
      <path d="M0 40 H260 l18 -22 l16 34 l14 -26 l10 14 H560 l12 -10 l12 10 H820 l16 -30 l18 40 l12 -18 H1200" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.5" />
      <path
        d="M0 40 H260 l18 -22 l16 34 l14 -26 l10 14 H560 l12 -10 l12 10 H820 l16 -30 l18 40 l12 -18 H1200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="120 1400"
        style={{ animation: "footer-trace 7s linear infinite" }}
      />
      <style>{`@keyframes footer-trace{from{stroke-dashoffset:1520}to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}

export function SiteFooter({ settings, categories }: { settings: SettingsDTO; categories: CategoryDTO[] }) {
  const year = new Date().getFullYear();
  const nav = settings.nav.filter((n) => n.enabled);
  return (
    <footer className="relative mt-16 border-t border-line">
      <div className="absolute inset-x-0 -top-6">
        <Trace />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[1.5fr_0.8fr_1.2fr] lg:px-8">
        <div className="max-w-sm">
          <p className="text-2xl font-semibold tracking-tight" style={{ fontVariationSettings: '"opsz" 48' }}>
            {settings.ownerName}
          </p>
          {settings.role && <p className="mt-2 text-fog">{settings.role}</p>}
          {settings.footerNote && <p className="mt-4 text-sm text-fog">{settings.footerNote}</p>}
          <SocialLinks settings={settings} className="mt-6" />
        </div>
        <nav aria-label="Footer">
          <p className="mb-3 text-sm text-fog">Site</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-signal">
                Home
              </Link>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-signal">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="hover:text-signal">
                Search
              </Link>
            </li>
          </ul>
        </nav>
        {categories.length > 0 && (
          <nav aria-label="Engineering domains">
            <p className="mb-3 text-sm text-fog">Engineering domains</p>
            <ul className="grid gap-2 text-sm">
              {categories.map((c) => (
                <li key={c._id}>
                  <Link href={`/categories/${c.slug}`} className="inline-flex items-center gap-2 hover:text-signal">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-6 text-xs text-fog sm:px-6 lg:px-8">
        <p>
          © {year} {settings.ownerName}
        </p>
        <p className="font-mono">
          <Link href="/sitemap.xml" className="hover:text-frost">
            sitemap.xml
          </Link>
        </p>
      </div>
    </footer>
  );
}
