import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Types, type PipelineStage } from "mongoose";
import { connectDB } from "../db";
import { BlogCategory, BlogPost, Category, Certification, Project, SiteSettings, Skill, TimelineEvent } from "../models";
import { DEFAULT_IMPACT, DEFAULT_NAV } from "../content/defaults";
import { escapeRegex } from "../utils";
import { serialize } from "./serialize";
import { CACHE_TAGS } from "../revalidate";
import type {
  BlogCardDTO, BlogCategoryDTO, BlogPostDTO, CategoryDTO, CertificationDTO, Paginated, ProjectCardDTO, ProjectDTO, SettingsDTO, SkillDTO, TimelineDTO,
} from "../content/types";

const PUBLISHED_PROJECT = { status: "published" } as const;
const publishedPostFilter = () => ({ status: "published", publishedAt: { $ne: null, $lte: new Date() } });

/** Card-shaped project fields — never pull section markdown for lists. */
const PROJECT_CARD_SELECT =
  "title slug summary category technologies githubUrl demoUrl coverImage projectState featured isSample publishedAt sections.enabled implementationSteps.title";

const REVALIDATE = 120;

/* ---------------- Settings ---------------- */
const loadSettings = unstable_cache(
  async (): Promise<SettingsDTO> => {
    await connectDB();
    let doc = await SiteSettings.findOne({ key: "site" }).lean();
    if (!doc) {
      doc = (await SiteSettings.findOneAndUpdate(
        { key: "site" },
        { $setOnInsert: { key: "site", nav: DEFAULT_NAV, impact: DEFAULT_IMPACT } },
        { upsert: true, returnDocument: "after" },
      ).lean())!;
    }
    const s = serialize<SettingsDTO>(doc);
    if (!s.nav?.length) s.nav = DEFAULT_NAV;
    return s;
  },
  ["site-settings"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.settings] },
);

export const getSettings = cache(() => loadSettings());

/* ---------------- Categories ---------------- */
const loadCategories = unstable_cache(
  async (): Promise<CategoryDTO[]> => {
    await connectDB();
    const [cats, counts] = await Promise.all([
      Category.find().sort({ order: 1, name: 1 }).lean(),
      Project.aggregate<{ _id: Types.ObjectId; n: number }>([{ $match: PUBLISHED_PROJECT }, { $group: { _id: "$category", n: { $sum: 1 } } }]),
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    return serialize<CategoryDTO[]>(cats).map((c) => ({ ...c, projectCount: byId.get(c._id) ?? 0 }));
  },
  ["categories"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.categories, CACHE_TAGS.projects] },
);

export const getCategories = cache(() => loadCategories());

export const getCategoryBySlug = cache(async (slug: string) => {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
});

/* ---------------- Projects ---------------- */
function toCard(p: ProjectDTO): ProjectCardDTO {
  const narrative = (p.sections ?? []).some((s) => s.enabled);
  return {
    _id: p._id,
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    category: p.category,
    technologies: p.technologies,
    githubUrl: p.githubUrl,
    demoUrl: p.demoUrl,
    coverImage: p.coverImage,
    projectState: p.projectState,
    featured: p.featured,
    isSample: p.isSample,
    publishedAt: p.publishedAt,
    hasCaseStudy: narrative || (p.implementationSteps?.length ?? 0) > 0,
  };
}

export type ProjectQuery = {
  q?: string;
  category?: string; // slug
  tech?: string;
  sort?: "featured" | "newest" | "oldest" | "title";
  page?: number;
  pageSize?: number;
};

async function listProjectsUncached(query: ProjectQuery = {}): Promise<Paginated<ProjectCardDTO>> {
  await connectDB();
  const pageSize = Math.min(Math.max(query.pageSize ?? 9, 1), 48);
  const page = Math.max(query.page ?? 1, 1);
  const filter: Record<string, unknown> = { ...PUBLISHED_PROJECT };

  if (query.category) {
    const cat = await Category.findOne({ slug: query.category }).select("_id").lean();
    if (!cat) return { items: [], total: 0, page, pageSize, pages: 0 };
    filter.category = cat._id;
  }
  if (query.tech) filter["technologies.name"] = new RegExp(`^${escapeRegex(query.tech)}$`, "i");
  if (query.q?.trim()) {
    const rx = new RegExp(escapeRegex(query.q.trim()), "i");
    filter.$or = [{ title: rx }, { summary: rx }, { tags: rx }, { "technologies.name": rx }];
  }

  const sort: Record<string, 1 | -1> =
    query.sort === "newest" ? { publishedAt: -1 } : query.sort === "oldest" ? { publishedAt: 1 } : query.sort === "title" ? { title: 1 } : { featured: -1, order: 1, publishedAt: -1 };

  const [docs, total] = await Promise.all([
    Project.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select(PROJECT_CARD_SELECT)
      .populate("category")
      .lean(),
    Project.countDocuments(filter),
  ]);
  return { items: serialize<ProjectDTO[]>(docs).map(toCard), total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function listProjects(query: ProjectQuery = {}): Promise<Paginated<ProjectCardDTO>> {
  const key = JSON.stringify({
    q: query.q ?? "",
    category: query.category ?? "",
    tech: query.tech ?? "",
    sort: query.sort ?? "featured",
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 9,
  });
  return unstable_cache(() => listProjectsUncached(query), ["list-projects", key], {
    revalidate: REVALIDATE,
    tags: [CACHE_TAGS.projects, CACHE_TAGS.categories],
  })();
}

export async function getFeaturedProjects(limit = 4): Promise<ProjectCardDTO[]> {
  return unstable_cache(
    async () => {
      await connectDB();
      let docs = await Project.find({ ...PUBLISHED_PROJECT, featured: true })
        .sort({ order: 1, publishedAt: -1 })
        .limit(limit)
        .select(PROJECT_CARD_SELECT)
        .populate("category")
        .lean();
      if (docs.length === 0) {
        docs = await Project.find(PUBLISHED_PROJECT)
          .sort({ order: 1, publishedAt: -1 })
          .limit(limit)
          .select(PROJECT_CARD_SELECT)
          .populate("category")
          .lean();
      }
      return serialize<ProjectDTO[]>(docs).map(toCard);
    },
    ["featured-projects", String(limit)],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.projects] },
  )();
}

export const getProjectBySlug = cache(async (slug: string, opts: { includeDrafts?: boolean } = {}): Promise<ProjectDTO | null> => {
  if (opts.includeDrafts) {
    await connectDB();
    const doc = await Project.findOne({ slug }).populate("category").lean();
    return doc ? serialize<ProjectDTO>(doc) : null;
  }
  return unstable_cache(
    async () => {
      await connectDB();
      const doc = await Project.findOne({ slug, ...PUBLISHED_PROJECT }).populate("category").lean();
      return doc ? serialize<ProjectDTO>(doc) : null;
    },
    ["project-slug", slug],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.projects] },
  )();
});

export async function getProjectByIdForPreview(id: string): Promise<ProjectDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await Project.findById(id).populate("category").lean();
  return doc ? serialize<ProjectDTO>(doc) : null;
}

export async function getRelatedProjects(project: ProjectDTO, limit = 3): Promise<ProjectCardDTO[]> {
  return unstable_cache(
    async () => {
      await connectDB();
      const chosen = project.relatedProjects?.filter((id) => Types.ObjectId.isValid(id)) ?? [];
      let docs = chosen.length
        ? await Project.find({ _id: { $in: chosen }, ...PUBLISHED_PROJECT }).select(PROJECT_CARD_SELECT).populate("category").limit(limit).lean()
        : [];
      if (docs.length < limit && project.category?._id) {
        const more = await Project.find({ _id: { $nin: [project._id, ...docs.map((d) => d._id)] }, category: project.category._id, ...PUBLISHED_PROJECT })
          .sort({ featured: -1, publishedAt: -1 })
          .limit(limit - docs.length)
          .select(PROJECT_CARD_SELECT)
          .populate("category")
          .lean();
        docs = [...docs, ...more];
      }
      return serialize<ProjectDTO[]>(docs).map(toCard);
    },
    ["related-projects", project._id, String(limit)],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.projects] },
  )();
}

export const getTechnologies = cache(() =>
  unstable_cache(
    async (): Promise<string[]> => {
      await connectDB();
      const rows = await Project.aggregate<{ _id: string; n: number }>([
        { $match: PUBLISHED_PROJECT },
        { $unwind: "$technologies" },
        { $group: { _id: "$technologies.name", n: { $sum: 1 } } },
        { $sort: { n: -1, _id: 1 } },
        { $limit: 40 },
      ] as PipelineStage[]);
      return rows.map((r) => r._id);
    },
    ["technologies"],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.projects] },
  )(),
);

export async function countPublished() {
  return unstable_cache(
    async () => {
      await connectDB();
      const [projects, posts, categories] = await Promise.all([
        Project.countDocuments(PUBLISHED_PROJECT),
        BlogPost.countDocuments(publishedPostFilter()),
        Category.countDocuments(),
      ]);
      return { projects, posts, categories };
    },
    ["count-published"],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.counts, CACHE_TAGS.projects, CACHE_TAGS.posts, CACHE_TAGS.categories] },
  )();
}

/* ---------------- Blog ---------------- */
const loadBlogCategories = unstable_cache(
  async (): Promise<BlogCategoryDTO[]> => {
    await connectDB();
    const [cats, counts] = await Promise.all([
      BlogCategory.find().sort({ order: 1, name: 1 }).lean(),
      BlogPost.aggregate<{ _id: Types.ObjectId; n: number }>([{ $match: publishedPostFilter() }, { $unwind: "$categories" }, { $group: { _id: "$categories", n: { $sum: 1 } } }]),
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    return serialize<BlogCategoryDTO[]>(cats).map((c) => ({ ...c, postCount: byId.get(c._id) ?? 0 }));
  },
  ["blog-categories"],
  { revalidate: REVALIDATE, tags: [CACHE_TAGS.blogCategories, CACHE_TAGS.posts] },
);

export const getBlogCategories = cache(() => loadBlogCategories());

const CARD_FIELDS = "title slug excerpt coverImage categories readingMinutes publishedAt featured isSample";

async function listPostsUncached(query: { category?: string; q?: string; tag?: string; page?: number; pageSize?: number } = {}): Promise<Paginated<BlogCardDTO>> {
  await connectDB();
  const pageSize = Math.min(Math.max(query.pageSize ?? 9, 1), 48);
  const page = Math.max(query.page ?? 1, 1);
  const filter: Record<string, unknown> = publishedPostFilter();
  if (query.category) {
    const cat = await BlogCategory.findOne({ slug: query.category }).select("_id").lean();
    if (!cat) return { items: [], total: 0, page, pageSize, pages: 0 };
    filter.categories = cat._id;
  }
  if (query.tag) filter.tags = query.tag;
  if (query.q?.trim()) {
    const rx = new RegExp(escapeRegex(query.q.trim()), "i");
    filter.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }];
  }
  const [docs, total] = await Promise.all([
    BlogPost.find(filter).sort({ featured: -1, publishedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).select(CARD_FIELDS).populate("categories").lean(),
    BlogPost.countDocuments(filter),
  ]);
  return { items: serialize<BlogCardDTO[]>(docs), total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function listPosts(query: { category?: string; q?: string; tag?: string; page?: number; pageSize?: number } = {}): Promise<Paginated<BlogCardDTO>> {
  const key = JSON.stringify({
    category: query.category ?? "",
    q: query.q ?? "",
    tag: query.tag ?? "",
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 9,
  });
  return unstable_cache(() => listPostsUncached(query), ["list-posts", key], {
    revalidate: REVALIDATE,
    tags: [CACHE_TAGS.posts, CACHE_TAGS.blogCategories],
  })();
}

export async function getLatestPosts(limit = 3): Promise<BlogCardDTO[]> {
  return unstable_cache(
    async () => {
      await connectDB();
      const docs = await BlogPost.find(publishedPostFilter()).sort({ publishedAt: -1 }).limit(limit).select(CARD_FIELDS).populate("categories").lean();
      return serialize<BlogCardDTO[]>(docs);
    },
    ["latest-posts", String(limit)],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.posts] },
  )();
}

export const getPostBySlug = cache(async (slug: string): Promise<BlogPostDTO | null> =>
  unstable_cache(
    async () => {
      await connectDB();
      const doc = await BlogPost.findOne({ slug, ...publishedPostFilter() }).populate("categories").lean();
      return doc ? serialize<BlogPostDTO>(doc) : null;
    },
    ["post-slug", slug],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.posts] },
  )(),
);

export async function getPostByIdForPreview(id: string): Promise<BlogPostDTO | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await BlogPost.findById(id).populate("categories").lean();
  return doc ? serialize<BlogPostDTO>(doc) : null;
}

export async function getProjectCardsByIds(ids: string[]): Promise<ProjectCardDTO[]> {
  const valid = ids.filter((id) => Types.ObjectId.isValid(id));
  if (!valid.length) return [];
  return unstable_cache(
    async () => {
      await connectDB();
      const docs = await Project.find({ _id: { $in: valid }, ...PUBLISHED_PROJECT }).select(PROJECT_CARD_SELECT).populate("category").lean();
      return serialize<ProjectDTO[]>(docs).map(toCard);
    },
    ["project-cards", valid.slice().sort().join(",")],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.projects] },
  )();
}

export async function getPostsForProject(projectId: string, limit = 3): Promise<BlogCardDTO[]> {
  return unstable_cache(
    async () => {
      await connectDB();
      const docs = await BlogPost.find({ ...publishedPostFilter(), relatedProjects: projectId })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select(CARD_FIELDS)
        .populate("categories")
        .lean();
      return serialize<BlogCardDTO[]>(docs);
    },
    ["posts-for-project", projectId, String(limit)],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.posts] },
  )();
}

/* ---------------- Profile / Engineering journey ---------------- */
function normTitle(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Homepage + About journey: published timeline milestones, plus certifications
 * and published projects (so those don't need a duplicate manual milestone).
 */
export const getTimeline = cache(() =>
  unstable_cache(
    async (): Promise<TimelineDTO[]> => {
      await connectDB();
      const [milestones, certs, projects] = await Promise.all([
        TimelineEvent.find({ published: true }).lean(),
        Certification.find().lean(),
        Project.find(PUBLISHED_PROJECT).select("title slug summary publishedAt createdAt").lean(),
      ]);

      const items: TimelineDTO[] = serialize<TimelineDTO[]>(milestones);
      const seen = new Set(items.map((i) => normTitle(i.title)));

      for (const c of certs) {
        const title = String(c.name ?? "").trim();
        if (!title || seen.has(normTitle(title))) continue;
        seen.add(normTitle(title));
        const when = c.issuedAt ?? (c as { createdAt?: Date }).createdAt ?? new Date();
        items.push({
          _id: `cert-${String(c._id)}`,
          title,
          date: new Date(when).toISOString(),
          kind: "certification",
          description: c.issuer ? `Issued by ${c.issuer}` : "",
          link: c.credentialUrl || "",
          published: true,
        });
      }

      for (const p of projects) {
        const title = String(p.title ?? "").trim();
        if (!title || seen.has(normTitle(title))) continue;
        seen.add(normTitle(title));
        const when = p.publishedAt ?? (p as { createdAt?: Date }).createdAt ?? new Date();
        items.push({
          _id: `project-${String(p._id)}`,
          title,
          date: new Date(when).toISOString(),
          kind: "project",
          description: p.summary || "",
          link: `/projects/${p.slug}`,
          published: true,
        });
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return items;
    },
    ["timeline-journey-v2"],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.timeline, CACHE_TAGS.certifications, CACHE_TAGS.projects] },
  )(),
);

export const getSkills = cache(() =>
  unstable_cache(
    async (): Promise<SkillDTO[]> => {
      await connectDB();
      return serialize<SkillDTO[]>(await Skill.find().sort({ group: 1, order: 1, name: 1 }).lean());
    },
    ["skills"],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.skills] },
  )(),
);

export const getCertifications = cache(() =>
  unstable_cache(
    async (): Promise<CertificationDTO[]> => {
      await connectDB();
      return serialize<CertificationDTO[]>(await Certification.find().sort({ order: 1, issuedAt: -1 }).lean());
    },
    ["certifications"],
    { revalidate: REVALIDATE, tags: [CACHE_TAGS.certifications] },
  )(),
);

/* ---------------- Sitemap ---------------- */
export async function sitemapEntries() {
  await connectDB();
  const [projects, posts, cats, blogCats] = await Promise.all([
    Project.find(PUBLISHED_PROJECT).select("slug updatedAt").lean(),
    BlogPost.find(publishedPostFilter()).select("slug updatedAt").lean(),
    Category.find().select("slug updatedAt").lean(),
    BlogCategory.find().select("slug updatedAt").lean(),
  ]);
  return { projects, posts, cats, blogCats };
}
