import { adminCategories, adminProjectOptions } from "@/lib/queries/admin";
import { ProjectEditor } from "@/components/admin/project-editor";
import { emptyProject } from "@/lib/content/empty";
import { env } from "@/lib/env";

export const metadata = { title: "New project" };

export default async function NewProject({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, categories, projects] = await Promise.all([searchParams, adminCategories(), adminProjectOptions()]);
  const initial = emptyProject();
  if (category && categories.some((c) => c._id === category)) initial.category = category;
  return <ProjectEditor id={null} initial={initial} categories={categories.map((c) => ({ _id: c._id, name: c.name }))} projects={projects} uploadsEnabled={!!env.cloudinary} />;
}
