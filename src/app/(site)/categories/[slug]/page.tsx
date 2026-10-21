import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategories, getCategoryBySlug, getTechnologies, listProjects } from "@/lib/queries/public";
import { DynamicIcon } from "@/lib/content/icons";
import { Container } from "@/components/site/section-header";
import { ProjectExplorer } from "@/components/site/project-explorer";
import { ProjectResults } from "@/components/site/project-results";
import { Markdown } from "@/components/content/markdown";
import { SmartImage } from "@/components/media/smart-image";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  if (!c) return { title: "Category not found", robots: { index: false } };
  return {
    title: c.name,
    description: c.tagline || c.description.slice(0, 160) || `Projects in ${c.name}.`,
    alternates: { canonical: `/categories/${c.slug}` },
    openGraph: { title: c.name, images: c.cover?.url ? [{ url: c.cover.url }] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const q = { q: one(sp.q), tech: one(sp.tech), sort: one(sp.sort), view: one(sp.view), page: one(sp.page) };
  const [result, all, technologies] = await Promise.all([
    listProjects({ ...q, category: slug, sort: q.sort as "featured", page: Math.max(1, Number(q.page) || 1), pageSize: q.view === "list" ? 6 : 9 }),
    getCategories(),
    getTechnologies(),
  ]);
  const others = all.filter((c) => c.slug !== slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line pt-32 pb-14 md:pt-40" style={{ ["--c" as string]: category.color }}>
        <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 -right-20 h-[460px] w-[700px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--c)_22%,transparent),transparent)]" aria-hidden="true" />
        <Container className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-fog">
              <Link href="/#domains" className="hover:text-frost">
                Engineering domains
              </Link>
            </nav>
            <span className="mb-6 grid h-12 w-12 place-items-center rounded-xl border" style={{ borderColor: `color-mix(in srgb, ${category.color} 50%, transparent)`, color: category.color, background: `color-mix(in srgb, ${category.color} 10%, transparent)` }}>
              <DynamicIcon name={category.icon} className="h-6 w-6" />
            </span>
            <h1 className="max-w-4xl text-[2.4rem] leading-[1.04] tracking-tight sm:text-4xl md:text-5xl" style={{ fontVariationSettings: '"opsz" 96' }}>
              {category.name}
            </h1>
            {category.tagline && <p className="mt-4 max-w-2xl text-xl text-fog">{category.tagline}</p>}
            {category.description && <Markdown source={category.description} className="prose-lab mt-6" />}
          </div>
          {category.cover?.url && (
            <div className="relative hidden aspect-[4/3] w-80 overflow-hidden rounded-2xl border border-line md:block">
              <SmartImage src={category.cover.url} alt={category.cover.alt || ""} fill sizes="320px" className="object-cover" />
            </div>
          )}
        </Container>
      </section>

      <Container className="pt-10">
        <Suspense>
          <ProjectExplorer categories={[]} technologies={technologies} total={result.total} lockedCategory={slug}>
            <ProjectResults result={result} view={q.view === "list" ? "list" : "grid"} basePath={`/categories/${slug}`} params={q} emptyTitle={`No ${category.name} projects published yet`} emptyBody="Projects assigned to this domain appear here as soon as they're published." />
          </ProjectExplorer>
        </Suspense>

        {others.length > 0 && (
          <nav aria-label="Other domains" className="mt-24 border-t border-line pt-10">
            <p className="mb-4 text-sm text-fog">Other domains</p>
            <ul className="flex flex-wrap gap-2">
              {others.map((c) => (
                <li key={c._id}>
                  <Link href={`/categories/${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-fog hover:border-line-strong hover:text-frost">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
    </>
  );
}
