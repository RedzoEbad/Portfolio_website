import { adminCategories } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";
import { env } from "@/lib/env";

export const metadata = { title: "Engineering domains" };

export default async function AdminCategories() {
  const cats = await adminCategories();
  return (
    <>
      <AdminHeader title="Engineering domains" description="Project categories. New ones appear in the homepage domains list, navigation, filters and footer without any code changes. Drag to set their order." />
      <CategoryManager
        kind="project"
        uploadsEnabled={!!env.cloudinary}
        categories={cats.map((c) => ({ _id: c._id, name: c.name, slug: c.slug, tagline: c.tagline, description: c.description, icon: c.icon, color: c.color, cover: c.cover, order: c.order, showOnHome: c.showOnHome, count: c.projectCount ?? 0 }))}
      />
    </>
  );
}
