import Link from "next/link";
import { adminBlogCategories } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Blog categories" };

export default async function AdminBlogCategories() {
  const cats = await adminBlogCategories();
  return (
    <>
      <AdminHeader
        title="Blog categories"
        description={
          <>
            Articles can have several categories. Each gets a page at /blog/category/…{" "}
            <Link href="/admin/blog" className="text-signal underline">
              Back to articles
            </Link>
          </>
        }
      />
      <CategoryManager kind="blog" categories={cats.map((c) => ({ _id: c._id, name: c.name, slug: c.slug, description: c.description, color: c.color, order: c.order, count: c.postCount ?? 0 }))} />
    </>
  );
}
