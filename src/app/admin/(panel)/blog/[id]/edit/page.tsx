import { notFound } from "next/navigation";
import { adminBlogCategories, adminGetPost, adminProjectOptions } from "@/lib/queries/admin";
import { BlogEditor } from "@/components/admin/blog-editor";
import { env } from "@/lib/env";

export const metadata = { title: "Edit article" };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, cats, projects] = await Promise.all([adminGetPost(id), adminBlogCategories(), adminProjectOptions()]);
  if (!p) notFound();
  const initial = {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    coverImage: p.coverImage ? { url: p.coverImage.url, alt: p.coverImage.alt ?? "", caption: p.coverImage.caption ?? "" } : null,
    content: p.content ?? "",
    categories: p.categories ?? [],
    tags: p.tags ?? [],
    relatedProjects: p.relatedProjects ?? [],
    status: p.status,
    featured: p.featured,
    publishedAt: p.publishedAt ?? "",
    seo: { title: p.seo?.title ?? "", description: p.seo?.description ?? "", ogImage: p.seo?.ogImage ?? "" },
  };
  return <BlogEditor key={p._id + p.updatedAt} id={p._id} initial={initial} categories={cats.map((c) => ({ _id: c._id, name: c.name, color: c.color }))} projects={projects} uploadsEnabled={!!env.cloudinary} />;
}
