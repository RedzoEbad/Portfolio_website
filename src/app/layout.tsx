import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSettings } from "@/lib/queries/public";
import { siteUrl } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  let name = "Engineering Portfolio";
  let description = "Cloud, DevOps, SRE and AI infrastructure engineering portfolio.";
  let ogImage = "";
  let keywords: string[] = [];
  try {
    const s = await getSettings();
    name = s.seo.title || s.siteName || name;
    description = s.seo.description || s.hero.subheadline || description;
    ogImage = s.seo.ogImage;
    keywords = s.seo.keywords ?? [];
  } catch {
    /* database unavailable: fall back to static metadata; pages show their own error */
  }
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: name, template: `%s — ${name}` },
    description,
    keywords,
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: name, title: name, description, images: ogImage ? [{ url: ogImage }] : undefined },
    twitter: { card: ogImage ? "summary_large_image" : "summary", title: name, description, images: ogImage ? [ogImage] : undefined },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
    { media: "(prefers-color-scheme: light)", color: "#f3f6fb" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-auto" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
