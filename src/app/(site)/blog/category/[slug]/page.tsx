import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogCategories, listPosts } from "@/lib/queries/public";
import { Container, PageIntro } from "@/components/site/section-header";
import { BlogCategoryNav, BlogGrid } from "@/components/site/blog-list";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getBlogCategories()).find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found", robots: { index: false } };
  return { title: `${cat.name} articles`, description: cat.description || `Articles about ${cat.name}.`, alternates: { canonical: `/blog/category/${slug}` } };
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const categories = await getBlogCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listPosts({ category: slug, page });
  return (
    <>
      <PageIntro title={cat.name} lede={cat.description || `Articles filed under ${cat.name}.`} />
      <Container className="pt-12">
        <BlogCategoryNav categories={categories} active={slug} />
        <BlogGrid result={result} basePath={`/blog/category/${slug}`} params={{ page: sp.page }} emptyTitle={`No ${cat.name} articles yet`} />
      </Container>
    </>
  );
}
