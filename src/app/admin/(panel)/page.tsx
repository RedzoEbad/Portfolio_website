import Link from "next/link";
import { FilePlus2, FolderPlus, Inbox, Tags } from "lucide-react";
import { dashboardStats } from "@/lib/queries/admin";
import { AdminHeader, Panel, StatusPill } from "@/components/admin/ui";
import { Counter } from "@/components/motion/primitives";
import { buttonClass } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

function Stat({ label, value, sub, href }: { label: string; value: number; sub?: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-line bg-hull/50 p-5 transition-colors hover:border-line-strong">
      <p className="text-sm text-fog">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight group-hover:text-signal">
        <Counter value={value} />
      </p>
      {sub && <p className="mt-1 text-xs text-fog">{sub}</p>}
    </Link>
  );
}

export default async function Dashboard() {
  const s = await dashboardStats();
  const max = Math.max(1, ...s.byCat.map((c) => c.total));
  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Everything here is read live from MongoDB."
        actions={
          <>
            <Link href="/admin/projects/new" className={buttonClass("primary", "md")}>
              <FolderPlus className="h-4 w-4" /> New project
            </Link>
            <Link href="/admin/blog/new" className={buttonClass("secondary", "md")}>
              <FilePlus2 className="h-4 w-4" /> New article
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Projects" value={s.projects} sub={`${s.featured} featured`} href="/admin/projects" />
        <Stat label="Published projects" value={s.published} sub={`${s.drafts} draft${s.drafts === 1 ? "" : "s"}`} href="/admin/projects?status=published" />
        <Stat label="Published articles" value={s.postsPublished} sub={`${s.postsDraft} draft${s.postsDraft === 1 ? "" : "s"}${s.postsScheduled ? `, ${s.postsScheduled} scheduled` : ""}`} href="/admin/blog" />
        <Stat label="Domains" value={s.categories} sub={s.unread ? `${s.unread} unread message${s.unread === 1 ? "" : "s"}` : "No unread messages"} href="/admin/categories" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Projects per domain" description="Bar length is total projects; the bright part is published.">
          {s.byCat.length === 0 ? (
            <p className="text-sm text-fog">
              No domains yet.{" "}
              <Link href="/admin/categories" className="text-signal underline">
                Create one
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {s.byCat.map((c) => (
                <li key={c.name} className="grid grid-cols-[minmax(0,11rem)_1fr_3rem] items-center gap-3 text-sm">
                  <span className="truncate" title={c.name}>
                    {c.name}
                  </span>
                  <span className="relative h-2.5 overflow-hidden rounded-full bg-hull-2" role="img" aria-label={`${c.published} published of ${c.total}`}>
                    <span className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ width: `${(c.total / max) * 100}%`, background: c.color }} />
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(c.published / max) * 100}%`, background: c.color }} />
                  </span>
                  <span className="text-right font-mono text-xs text-fog">
                    {c.published}/{c.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recently updated">
          {s.recent.length === 0 ? (
            <p className="text-sm text-fog">Nothing yet. Create your first project or article to see it here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {s.recent.map((r) => (
                <li key={r.kind + r.id}>
                  <Link href={r.kind === "project" ? `/admin/projects/${r.id}/edit` : `/admin/blog/${r.id}/edit`} className="flex items-center gap-3 py-2.5 text-sm hover:text-signal">
                    <span className="w-14 shrink-0 text-xs text-fog">{r.kind === "project" ? "Project" : "Article"}</span>
                    <span className="min-w-0 flex-1 truncate">{r.title}</span>
                    <StatusPill status={r.status} />
                    <span className="hidden w-24 text-right text-xs text-fog sm:block">{formatDate(r.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/categories" className="flex items-center gap-3 rounded-xl border border-line p-4 text-sm hover:border-line-strong">
          <Tags className="h-4 w-4 text-signal" /> Add an engineering domain
        </Link>
        <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl border border-line p-4 text-sm hover:border-line-strong">
          <FolderPlus className="h-4 w-4 text-signal" /> Edit homepage and profile
        </Link>
        <Link href="/admin/messages" className="flex items-center gap-3 rounded-xl border border-line p-4 text-sm hover:border-line-strong">
          <Inbox className="h-4 w-4 text-signal" /> Read contact messages
        </Link>
      </div>
    </>
  );
}
