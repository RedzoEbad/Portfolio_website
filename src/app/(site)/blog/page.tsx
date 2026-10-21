import type { Metadata } from "next";
import { getBlogCategories, listPosts } from "@/lib/queries/public";
import { Container, PageIntro } from "@/components/site/section-header";
import { BlogCategoryNav, BlogGrid } from "@/components/site/blog-list";

export const revalidate = 120;
export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes on cloud, Kubernetes, Terraform, SRE, security and AI agents.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/rss.xml" } },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [result, categories] = await Promise.all([listPosts({ page, tag: sp.tag }), getBlogCategories()]);
  return (
    <>
      <PageIntro title={sp.tag ? `Articles tagged “${sp.tag}”` : "Learning in public"} lede="Write-ups from building and breaking things: what I tried, what I measured, and what I'd do differently." />
      <Container className="pt-12">
        <BlogCategoryNav categories={categories} />
        <BlogGrid result={result} basePath="/blog" params={{ page: sp.page, tag: sp.tag }} emptyTitle="No articles published yet" />
      </Container>
    </>
  );
}
