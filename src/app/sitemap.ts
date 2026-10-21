import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/queries/public";
import { siteUrl } from "@/lib/env";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const fixed = ["", "/projects", "/blog", "/about", "/contact"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }));
  try {
    const { projects, posts, cats, blogCats } = await sitemapEntries();
    return [
      ...fixed,
      ...cats.map((c) => ({ url: `${base}/categories/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
      ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.9 })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
      ...blogCats.map((c) => ({ url: `${base}/blog/category/${c.slug}`, lastModified: c.updatedAt, priority: 0.5 })),
    ];
  } catch {
    return fixed;
  }
}
