import Link from "next/link";
import { Suspense } from "react";
import { Plus, Tags } from "lucide-react";
import { adminBlogCategories, adminListPosts } from "@/lib/queries/admin";
import { AdminEmpty, AdminHeader, AdminPager, StatusPill } from "@/components/admin/ui";
import { ListFilters } from "@/components/admin/list-filters";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { buttonClass } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Blog" };

function displayStatus(status: string, publishedAt: string | null) {
  return status === "published" && publishedAt && new Date(publishedAt).getTime() > Date.now() ? "scheduled" : status;
}

export default async function AdminBlog({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ items, total, pages }, cats] = await Promise.all([adminListPosts({ q: sp.q, status: sp.status, category: sp.category, page }), adminBlogCategories()]);
  const filtered = Boolean(sp.q || sp.status || sp.category);

  return (
    <>
      <AdminHeader
        title="Blog"
        description={`${total} article${total === 1 ? "" : "s"}${filtered ? " match these filters" : ""}.`}
        actions={
          <>
            <Link href="/admin/blog/categories" className={buttonClass("secondary", "md")}>
              <Tags className="h-4 w-4" /> Categories
            </Link>
            <Link href="/admin/blog/new" className={buttonClass("primary", "md")}>
              <Plus className="h-4 w-4" /> New article
            </Link>
          </>
        }
      />
      <Suspense>
        <ListFilters
          selects={[
            { name: "status", label: "Status", options: [{ value: "", label: "Any status" }, { value: "published", label: "Published" }, { value: "scheduled", label: "Scheduled" }, { value: "draft", label: "Drafts" }] },
            { name: "category", label: "Category", options: [{ value: "", label: "Any category" }, ...cats.map((c) => ({ value: c._id, label: c.name }))] },
          ]}
        />
      </Suspense>
      {items.length === 0 ? (
        filtered ? <AdminEmpty title="No articles match" body="Change the search or filters." /> : <AdminEmpty title="No articles yet" body="Write your first article. Drafts stay private until you publish." action={{ href: "/admin/blog/new", label: "Write an article" }} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-line bg-hull/60 text-left text-xs text-fog">
              <tr>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="px-4 py-3 font-medium">Categories</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Publish date</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((p) => {
                const st = displayStatus(p.status, p.publishedAt);
                return (
                  <tr key={p._id} className="hover:bg-hull/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/blog/${p._id}/edit`} className="font-medium hover:text-signal">
                        {p.title}
                      </Link>
                      <span className="block font-mono text-xs text-fog">
                        /{p.slug} · {p.readingMinutes} min
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {p.categories.length === 0 && <span className="text-fog">None</span>}
                        {p.categories.map((c) => (
                          <span key={c._id} className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: `color-mix(in srgb, ${c.color} 45%, transparent)`, color: c.color }}>
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={st} />
                    </td>
                    <td className="px-4 py-3 text-fog">{p.publishedAt ? formatDate(p.publishedAt) : "—"}</td>
                    <td className="px-4 py-3">
                      <PostRowActions id={p._id} title={p.title} status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <AdminPager page={page} pages={pages} base="/admin/blog" params={sp} />
    </>
  );
}
