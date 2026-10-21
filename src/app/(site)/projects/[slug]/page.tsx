import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study/case-study";
import { getPostsForProject, getProjectBySlug, getRelatedProjects } from "@/lib/queries/public";
import { siteUrl } from "@/lib/env";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: "Project not found", robots: { index: false } };
  const title = p.seo?.title || p.title;
  const description = p.seo?.description || p.summary;
  const image = p.seo?.ogImage || p.coverImage?.url;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { type: "article", title, description, url: `/projects/${p.slug}`, images: image ? [{ url: image, alt: p.coverImage?.alt || p.title }] : undefined, publishedTime: p.publishedAt ?? undefined, modifiedTime: p.updatedAt },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
    robots: p.isSample ? { index: false } : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const [related, articles] = await Promise.all([getRelatedProjects(project, 3), getPostsForProject(project._id)]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${siteUrl()}/projects/${project.slug}`,
    image: project.coverImage?.url,
    datePublished: project.publishedAt,
    dateModified: project.updatedAt,
    keywords: [...project.tags, ...project.technologies.map((t) => t.name)].join(", "),
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <CaseStudy project={project} related={related} articles={articles} />
    </>
  );
}
