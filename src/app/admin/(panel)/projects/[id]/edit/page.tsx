import { notFound } from "next/navigation";
import { adminCategories, adminGetProject, adminProjectOptions } from "@/lib/queries/admin";
import { ProjectEditor } from "@/components/admin/project-editor";
import { CASE_STUDY_SECTIONS } from "@/lib/content/constants";
import { env } from "@/lib/env";

export const metadata = { title: "Edit project" };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories, projects] = await Promise.all([adminGetProject(id), adminCategories(), adminProjectOptions()]);
  if (!p) notFound();

  // Older documents may lack newer section types: append them, disabled.
  const have = new Set(p.sections.map((s) => s.type));
  const sections = [...p.sections, ...CASE_STUDY_SECTIONS.filter((s) => !have.has(s.type)).map((s) => ({ type: s.type, title: s.title, enabled: false, content: "" }))];

  const initial = {
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? "",
    category: p.category ?? null,
    tags: p.tags ?? [],
    technologies: p.technologies.map((t) => ({ name: t.name, role: t.role ?? "" })),
    githubUrl: p.githubUrl ?? "",
    demoUrl: p.demoUrl ?? "",
    coverImage: p.coverImage ? { url: p.coverImage.url, alt: p.coverImage.alt ?? "", caption: p.coverImage.caption ?? "" } : null,
    systemDesignImage: p.systemDesignImage ? { url: p.systemDesignImage.url, alt: p.systemDesignImage.alt ?? "", caption: p.systemDesignImage.caption ?? "" } : null,
    gallery: p.gallery.map((g) => ({ url: g.url, alt: g.alt ?? "", caption: g.caption ?? "" })),
    architectureImages: p.architectureImages.map((g) => ({ url: g.url, alt: g.alt ?? "", caption: g.caption ?? "" })),
    sections,
    implementationSteps: p.implementationSteps.map((s) => ({ title: s.title, body: s.body ?? "" })),
    codeSnippets: p.codeSnippets.map((c) => ({ title: c.title ?? "", language: c.language as "bash", code: c.code, caption: c.caption ?? "" })),
    relatedProjects: p.relatedProjects ?? [],
    projectState: p.projectState as "completed",
    status: p.status,
    featured: p.featured,
    order: p.order ?? 0,
    seo: { title: p.seo?.title ?? "", description: p.seo?.description ?? "", ogImage: p.seo?.ogImage ?? "" },
  };

  return <ProjectEditor key={p._id + p.updatedAt} id={p._id} initial={initial} categories={categories.map((c) => ({ _id: c._id, name: c.name }))} projects={projects} uploadsEnabled={!!env.cloudinary} />;
}
