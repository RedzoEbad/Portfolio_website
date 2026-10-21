import Link from "next/link";
import type { CategoryDTO, SettingsDTO } from "@/lib/content/types";
import { SocialLinks } from "./social-links";

export function SiteFooter({ settings, categories }: { settings: SettingsDTO; categories: CategoryDTO[] }) {
  const year = new Date().getFullYear();
  const nav = settings.nav.filter((n) => n.enabled);
  return (
    <footer className="relative mt-8 border-t border-line sm:mt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 pt-14 pb-10 sm:px-6 md:grid-cols-[1.4fr_0.7fr_1fr] lg:gap-16 lg:px-8 lg:pt-20">
        <div className="max-w-md">
          <p className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-tight" style={{ fontVariationSettings: '"opsz" 48' }}>
            {settings.ownerName}
          </p>
          {settings.role && <p className="mt-2 text-fog">{settings.role}</p>}
          {settings.footerNote && <p className="mt-4 text-sm leading-relaxed text-fog">{settings.footerNote}</p>}
          <SocialLinks settings={settings} className="mt-7" />
        </div>
        <nav aria-label="Footer">
          <p className="mb-4 font-mono text-[11px] tracking-[0.18em] text-fog uppercase">Site</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="transition-colors hover:text-signal">
                Home
              </Link>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition-colors hover:text-signal">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="transition-colors hover:text-signal">
                Search
              </Link>
            </li>
          </ul>
        </nav>
        {categories.length > 0 && (
          <nav aria-label="Engineering domains">
            <p className="mb-4 font-mono text-[11px] tracking-[0.18em] text-fog uppercase">Domains</p>
            <ul className="grid gap-2.5 text-sm sm:grid-cols-2 md:grid-cols-1">
              {categories.map((c) => (
                <li key={c._id}>
                  <Link href={`/categories/${c.slug}`} className="inline-flex items-center gap-2.5 transition-colors hover:text-signal">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-6 font-mono text-[11px] tracking-wide text-fog uppercase sm:px-6 lg:px-8">
        <p>
          © {year} {settings.ownerName}
        </p>
        <Link href="/sitemap.xml" className="hover:text-frost">
          sitemap.xml
        </Link>
      </div>
    </footer>
  );
}
