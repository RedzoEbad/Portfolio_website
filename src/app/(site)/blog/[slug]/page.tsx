import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/article";
import { getPostBySlug, getProjectCardsByIds, getSettings } from "@/lib/queries/public";
import { siteUrl } from "@/lib/env";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  const image = post.seo?.ogImage || post.coverImage?.url;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title, description, url: `/blog/${post.slug}`, publishedTime: post.publishedAt ?? undefined, modifiedTime: post.updatedAt, tags: post.tags, images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
    robots: post.isSample ? { index: false } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [projects, settings] = await Promise.all([getProjectCardsByIds(post.relatedProjects), getSettings()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage?.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: settings.ownerName },
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Article post={post} projects={projects} />
    </>
  );
}
