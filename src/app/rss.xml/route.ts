import { getSettings, listPosts } from "@/lib/queries/public";
import { siteUrl } from "@/lib/env";

export const revalidate = 300;

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const [settings, { items }] = await Promise.all([getSettings(), listPosts({ pageSize: 30 })]);
  const base = siteUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(settings.siteName)}</title>
<link>${base}/blog</link>
<description>${esc(settings.seo.description || settings.hero.subheadline || "")}</description>
<atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (p) => `<item><title>${esc(p.title)}</title><link>${base}/blog/${p.slug}</link><guid>${base}/blog/${p.slug}</guid>${p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : ""}<description>${esc(p.excerpt)}</description></item>`,
  )
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" } });
}
