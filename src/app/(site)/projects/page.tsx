import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getTechnologies, listProjects } from "@/lib/queries/public";
import { Container, PageIntro } from "@/components/site/section-header";
import { ProjectExplorer } from "@/components/site/project-explorer";
import { ProjectResults } from "@/components/site/project-results";

export const revalidate = 120;
export const metadata: Metadata = {
  title: "Projects",
  description: "Engineering case studies across cloud, DevOps, SRE, Kubernetes, infrastructure as code, security, full-stack and agentic AI.",
  alternates: { canonical: "/projects" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function ProjectsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const params = { q: one(sp.q), category: one(sp.category), tech: one(sp.tech), sort: one(sp.sort), view: one(sp.view), page: one(sp.page) };
  const page = Math.max(1, Number(params.page) || 1);
  const [result, categories, technologies] = await Promise.all([
    listProjects({ q: params.q, category: params.category, tech: params.tech, sort: params.sort as "featured", page, pageSize: params.view === "list" ? 6 : 9 }),
    getCategories(),
    getTechnologies(),
  ]);
  const filtered = Boolean(params.q || params.category || params.tech);

  return (
    <>
      <PageIntro title="Projects" lede="Every project here has a write-up behind it: the problem, the design, the parts that went wrong and how they were fixed." />
      <Container className="pt-10">
        <Suspense>
          <ProjectExplorer categories={categories.map((c) => ({ slug: c.slug, name: c.name, color: c.color, count: c.projectCount ?? 0 }))} technologies={technologies} total={result.total}>
            <ProjectResults
              result={result}
              view={params.view === "list" ? "list" : "grid"}
              basePath="/projects"
              params={params}
              emptyTitle={filtered ? "No projects match these filters" : "No projects published yet"}
              emptyBody={filtered ? "Try a different search term or clear the filters." : "Published case studies will appear here."}
            />
          </ProjectExplorer>
        </Suspense>
      </Container>
    </>
  );
}
