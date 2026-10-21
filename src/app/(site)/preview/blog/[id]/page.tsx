import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/site/article";
import { requireAdminPage } from "@/lib/auth/guard";
import { getPostByIdForPreview, getProjectCardsByIds } from "@/lib/queries/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function PostPreview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const post = await getPostByIdForPreview(id);
  if (!post) notFound();
  const projects = await getProjectCardsByIds(post.relatedProjects);
  return <Article post={post} projects={projects} preview />;
}
