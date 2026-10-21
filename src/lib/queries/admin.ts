import "server-only";
import { Types } from "mongoose";
import { connectDB } from "../db";
import { requireAdmin } from "../auth/guard";
import { BlogCategory, BlogPost, Category, Certification, ContactMessage, Project, SiteSettings, Skill, TimelineEvent } from "../models";
import { escapeRegex } from "../utils";
import { serialize } from "./serialize";
import { DEFAULT_IMPACT, DEFAULT_NAV } from "../content/defaults";
import type { BlogCategoryDTO, BlogPostDTO, CategoryDTO, CertificationDTO, ProjectDTO, SettingsDTO, SkillDTO, TimelineDTO } from "../content/types";

/** Every admin read re-checks the session; layouts alone aren't relied on for protection. */
async function guard() {
  await requireAdmin();
  await connectDB();
}

export async function dashboardStats() {
  await guard();
  const now = new Date();
  const [projects, published, featured, categories, postsPublished, postsDraft, postsScheduled, unread, recentProjects, recentPosts, perCategory] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: "published" }),
    Project.countDocuments({ featured: true }),
    Category.countDocuments(),
    BlogPost.countDocuments({ status: "published", publishedAt: { $lte: now } }),
    BlogPost.countDocuments({ status: "draft" }),
    BlogPost.countDocuments({ status: "published", publishedAt: { $gt: now } }),
    ContactMessage.countDocuments({ read: false }),
    Project.find().sort({ updatedAt: -1 }).limit(5).select("title status updatedAt").lean(),
    BlogPost.find().sort({ updatedAt: -1 }).limit(5).select("title status updatedAt publishedAt").lean(),
    Project.aggregate<{ _id: Types.ObjectId | null; total: number; published: number }>([
      { $group: { _id: "$category", total: { $sum: 1 }, published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } } } },
    ]),
  ]);
  const cats = await Category.find().sort({ order: 1 }).select("name color").lean();
  const byCat = cats.map((c) => {
    const row = perCategory.find((r) => String(r._id) === String(c._id));
    return { name: c.name, color: c.color, total: row?.total ?? 0, published: row?.published ?? 0 };
  });
  const uncategorised = perCategory.find((r) => r._id === null);
  if (uncategorised) byCat.push({ name: "Uncategorised", color: "#93a0bf", total: uncategorised.total, published: uncategorised.published });

  const recent = [
    ...recentProjects.map((p) => ({ kind: "project" as const, id: String(p._id), title: p.title, status: p.status, updatedAt: p.updatedAt })),
    ...recentPosts.map((p) => ({ kind: "post" as const, id: String(p._id), title: p.title, status: p.status === "published" && p.publishedAt && p.publishedAt > now ? "scheduled" : p.status, updatedAt: p.updatedAt })),
  ]
    .sort((a, b) => +new Date(b.updatedAt!) - +new Date(a.updatedAt!))
    .slice(0, 8);

  return serialize<{
    projects: number; published: number; drafts: number; featured: number; categories: number;
    postsPublished: number; postsDraft: number; postsScheduled: number; unread: number;
    byCat: { name: string; color: string; total: number; published: number }[];
    recent: { kind: "project" | "post"; id: string; title: string; status: string; updatedAt: string }[];
  }>({ projects, published, drafts: projects - published, featured, categories, postsPublished, postsDraft, postsScheduled, unread, byCat, recent });
}

export type AdminListQuery = { q?: string; status?: string; category?: string; page?: number };

export async function adminListProjects({ q, status, category, page = 1 }: AdminListQuery) {
  await guard();
  const pageSize = 20;
  const filter: Record<string, unknown> = {};
  if (status === "draft" || status === "published") filter.status = status;
  if (status === "featured") filter.featured = true;
  if (category === "none") filter.category = null;
  else if (category && Types.ObjectId.isValid(category)) filter.category = new Types.ObjectId(category);
  if (q?.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ title: rx }, { slug: rx }, { tags: rx }, { "technologies.name": rx }];
  }
  const [items, total] = await Promise.all([
    Project.find(filter).sort({ order: 1, updatedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).select("title slug status featured category projectState updatedAt publishedAt coverImage isSample order").populate("category", "name color").lean(),
    Project.countDocuments(filter),
  ]);
  return { items: serialize<ProjectDTO[]>(items), total, page, pages: Math.ceil(total / pageSize) };
}

export async function adminGetProject(id: string) {
  await guard();
  if (!Types.ObjectId.isValid(id)) return null;
  const doc = await Project.findById(id).lean();
  return doc ? serialize<Omit<ProjectDTO, "category"> & { category: string | null }>(doc) : null;
}

export async function adminProjectOptions() {
  await guard();
  return serialize<{ _id: string; title: string; status: string }[]>(await Project.find().sort({ title: 1 }).select("title status").lean());
}

export async function adminCategories() {
  await guard();
  const [cats, counts] = await Promise.all([Category.find().sort({ order: 1, name: 1 }).lean(), Project.aggregate<{ _id: Types.ObjectId; n: number }>([{ $group: { _id: "$category", n: { $sum: 1 } } }])]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return serialize<CategoryDTO[]>(cats).map((c) => ({ ...c, projectCount: byId.get(c._id) ?? 0 }));
}

export async function adminBlogCategories() {
  await guard();
  const [cats, counts] = await Promise.all([BlogCategory.find().sort({ order: 1, name: 1 }).lean(), BlogPost.aggregate<{ _id: Types.ObjectId; n: number }>([{ $unwind: "$categories" }, { $group: { _id: "$categories", n: { $sum: 1 } } }])]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return serialize<BlogCategoryDTO[]>(cats).map((c) => ({ ...c, postCount: byId.get(c._id) ?? 0 }));
}

export async function adminListPosts({ q, status, category, page = 1 }: AdminListQuery) {
  await guard();
  const pageSize = 20;
  const now = new Date();
  const filter: Record<string, unknown> = {};
  if (status === "draft") filter.status = "draft";
  if (status === "published") Object.assign(filter, { status: "published", publishedAt: { $lte: now } });
  if (status === "scheduled") Object.assign(filter, { status: "published", publishedAt: { $gt: now } });
  if (category && Types.ObjectId.isValid(category)) filter.categories = new Types.ObjectId(category);
  if (q?.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ title: rx }, { slug: rx }, { tags: rx }];
  }
  const [items, total] = await Promise.all([
    BlogPost.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).select("title slug status featured categories publishedAt updatedAt readingMinutes isSample").populate("categories", "name color").lean(),
    BlogPost.countDocuments(filter),
  ]);
  return { items: serialize<BlogPostDTO[]>(items), total, page, pages: Math.ceil(total / pageSize) };
}

export async function adminGetPost(id: string) {
  await guard();
  if (!Types.ObjectId.isValid(id)) return null;
  const doc = await BlogPost.findById(id).lean();
  return doc ? serialize<Omit<BlogPostDTO, "categories"> & { categories: string[] }>(doc) : null;
}

export async function adminSettings(): Promise<SettingsDTO> {
  await guard();
  const doc = await SiteSettings.findOneAndUpdate({ key: "site" }, { $setOnInsert: { key: "site", nav: DEFAULT_NAV, impact: DEFAULT_IMPACT } }, { upsert: true, returnDocument: "after" }).lean();
  return serialize<SettingsDTO>(doc);
}

export async function adminSkills() {
  await guard();
  return serialize<SkillDTO[]>(await Skill.find().sort({ group: 1, order: 1, name: 1 }).lean());
}
export async function adminCertifications() {
  await guard();
  return serialize<CertificationDTO[]>(await Certification.find().sort({ order: 1, issuedAt: -1 }).lean());
}
export async function adminTimeline() {
  await guard();
  return serialize<TimelineDTO[]>(await TimelineEvent.find().sort({ date: -1 }).lean());
}

export async function adminMessages(page = 1) {
  await guard();
  const pageSize = 25;
  const [items, total] = await Promise.all([ContactMessage.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(), ContactMessage.countDocuments()]);
  return {
    items: serialize<{ _id: string; name: string; email: string; subject: string; message: string; read: boolean; createdAt: string }[]>(items),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  };
}
