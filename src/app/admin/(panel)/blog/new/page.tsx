import { adminBlogCategories, adminProjectOptions } from "@/lib/queries/admin";
import { BlogEditor } from "@/components/admin/blog-editor";
import { emptyPost } from "@/lib/content/empty";
import { env } from "@/lib/env";

export const metadata = { title: "New article" };

export default async function NewPost() {
  const [cats, projects] = await Promise.all([adminBlogCategories(), adminProjectOptions()]);
  return <BlogEditor id={null} initial={emptyPost()} categories={cats.map((c) => ({ _id: c._id, name: c.name, color: c.color }))} projects={projects} uploadsEnabled={!!env.cloudinary} />;
}
