import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study/case-study";
import { requireAdminPage } from "@/lib/auth/guard";
import { getProjectByIdForPreview, getRelatedProjects } from "@/lib/queries/public";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Admin-only preview of any project, including drafts. */
export default async function ProjectPreview({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const project = await getProjectByIdForPreview(id);
  if (!project) notFound();
  const related = await getRelatedProjects(project, 3);
  return <CaseStudy project={project} related={related} preview />;
}
