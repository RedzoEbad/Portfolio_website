import type { Paginated, ProjectCardDTO } from "@/lib/content/types";
import { ProjectFeature, ProjectTile } from "./project-card";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";

export function ProjectResults({ result, view, basePath, params, emptyTitle, emptyBody }: { result: Paginated<ProjectCardDTO>; view: "grid" | "list"; basePath: string; params: Record<string, string | undefined>; emptyTitle: string; emptyBody: string }) {
  if (!result.items.length) return <EmptyState title={emptyTitle} body={emptyBody} />;
  return (
    <>
      {view === "list" ? (
        <div className="space-y-20">
          {result.items.map((p, i) => (
            <ProjectFeature key={p._id} p={p} flip={i % 2 === 1} priority={i === 0} />
          ))}
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((p) => (
            <li key={p._id}>
              <ProjectTile p={p} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={result.page} pages={result.pages} basePath={basePath} params={params} />
    </>
  );
}
