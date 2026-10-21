import type { Metadata } from "next";
import { listPosts, listProjects } from "@/lib/queries/public";
import { Container, PageIntro } from "@/components/site/section-header";
import { ProjectTile } from "@/components/site/project-card";
import { BlogCard } from "@/components/site/blog-card";
import { EmptyState } from "@/components/site/empty-state";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 100);
  const [projects, posts] = term ? await Promise.all([listProjects({ q: term, pageSize: 12 }), listPosts({ q: term, pageSize: 9 })]) : [null, null];

  return (
    <>
      <PageIntro title={term ? `Results for “${term}”` : "Search"}>
        <form action="/search" role="search" className="mt-8 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <input id="q" name="q" defaultValue={term} placeholder="Terraform, Kubernetes, incident…" className="h-12 flex-1 rounded-lg border border-line-strong bg-abyss/60 px-4 placeholder:text-fog focus:border-signal focus:outline-none" />
          <button className="h-12 rounded-lg bg-signal px-5 font-medium text-signal-ink">Search</button>
        </form>
      </PageIntro>
      <Container className="pt-12">
        {!term ? (
          <p className="text-fog">Search project titles, summaries, tags, technologies and article titles.</p>
        ) : projects!.total + posts!.total === 0 ? (
          <EmptyState command={`grep -ri "${term}" ./projects ./blog`} title="Nothing matched" body="Try a broader term, such as a technology name." />
        ) : (
          <div className="space-y-20">
            {projects!.total > 0 && (
              <section aria-labelledby="sr-projects">
                <h2 id="sr-projects" className="mb-6 text-2xl tracking-tight">
                  Projects <span className="font-mono text-base text-fog">{projects!.total}</span>
                </h2>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projects!.items.map((p) => (
                    <li key={p._id}>
                      <ProjectTile p={p} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {posts!.total > 0 && (
              <section aria-labelledby="sr-posts">
                <h2 id="sr-posts" className="mb-6 text-2xl tracking-tight">
                  Articles <span className="font-mono text-base text-fog">{posts!.total}</span>
                </h2>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts!.items.map((p) => (
                    <li key={p._id}>
                      <BlogCard post={p} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
