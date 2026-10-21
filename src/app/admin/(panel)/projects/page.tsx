import Link from "next/link";
import { Suspense } from "react";
import { Plus, Star } from "lucide-react";
import { adminCategories, adminListProjects } from "@/lib/queries/admin";
import { AdminEmpty, AdminHeader, AdminPager, StatusPill } from "@/components/admin/ui";
import { ListFilters } from "@/components/admin/list-filters";
import { ProjectRowActions } from "@/components/admin/project-row-actions";
import { buttonClass } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Projects" };

export default async function AdminProjects({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [{ items, total, pages }, categories] = await Promise.all([adminListProjects({ q: sp.q, status: sp.status, category: sp.category, page }), adminCategories()]);
  const filtered = Boolean(sp.q || sp.status || sp.category);

  return (
    <>
      <AdminHeader
        title="Projects"
        description={`${total} project${total === 1 ? "" : "s"}${filtered ? " match these filters" : ""}.`}
        actions={
          <Link href="/admin/projects/new" className={buttonClass("primary", "md")}>
            <Plus className="h-4 w-4" /> New project
          </Link>
        }
      />
      <Suspense>
        <ListFilters
          selects={[
            { name: "status", label: "Status", options: [{ value: "", label: "Any status" }, { value: "published", label: "Published" }, { value: "draft", label: "Drafts" }, { value: "featured", label: "Featured" }] },
            { name: "category", label: "Domain", options: [{ value: "", label: "Any domain" }, ...categories.map((c) => ({ value: c._id, label: c.name })), { value: "none", label: "Uncategorised" }] },
          ]}
        />
      </Suspense>
      {items.length === 0 ? (
        filtered ? (
          <AdminEmpty title="No projects match" body="Change the search or filters." />
        ) : (
          <AdminEmpty title="No projects yet" body="Create your first case study. It stays a draft until you publish it." action={{ href: "/admin/projects/new", label: "Create a project" }} />
        )
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-hull/60 text-left text-xs text-fog">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-hull/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/projects/${p._id}/edit`} className="flex items-center gap-3 font-medium hover:text-signal">
                      <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-line bg-hull-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.coverImage?.url && <img src={p.coverImage.url} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          {p.title}
                          {p.featured && <Star className="h-3.5 w-3.5 fill-signal text-signal" aria-label="Featured" />}
                        </span>
                        <span className="block font-mono text-xs font-normal text-fog">/{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {p.category ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: p.category.color }} />
                        {p.category.name}
                      </span>
                    ) : (
                      <span className="text-fog">Uncategorised</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} />
                    {p.isSample && <span className="ml-2 text-xs text-flare">sample</span>}
                  </td>
                  <td className="px-4 py-3 text-fog">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <ProjectRowActions id={p._id} title={p.title} status={p.status} featured={p.featured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPager page={page} pages={pages} base="/admin/projects" params={sp} />
    </>
  );
}
