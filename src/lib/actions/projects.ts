"use server";

import { Types } from "mongoose";
import { connectDB } from "../db";
import { Category, Project, BlogPost } from "../models";
import { requireAdmin } from "../auth/guard";
import { projectSchema } from "../validation/schemas";
import { slugify } from "../utils";
import { fail, handleError, zodFail, type ActionResult } from "./result";
import { revalidatePublic } from "../revalidate";

export async function saveProjectAction(id: string | null, input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const parsed = projectSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = parsed.data;
    await connectDB();

    if (id && !Types.ObjectId.isValid(id)) return fail("That project no longer exists.");
    if (data.category && !(await Category.exists({ _id: data.category }))) return fail("The selected category was deleted. Pick another.", { category: "Category not found." });
    const clash = await Project.exists({ slug: data.slug, ...(id ? { _id: { $ne: id } } : {}) });
    if (clash) return fail("Another project already uses this slug.", { slug: "Already in use." });

    const relatedProjects = data.relatedProjects.filter((r) => r !== id);
    const existing = id ? await Project.findById(id) : null;
    if (id && !existing) return fail("That project no longer exists.");

    const publishedAt = data.status === "published" ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);
    const doc = existing ?? new Project();
    doc.set({ ...data, relatedProjects, publishedAt });
    await doc.save();
    revalidatePublic({ project: doc.slug });
    return { ok: true, data: { id: String(doc._id), slug: doc.slug }, message: data.status === "published" ? "Project saved and published." : "Draft saved." };
  } catch (err) {
    return handleError(err);
  }
}

export async function setProjectStatusAction(id: string, status: "draft" | "published"): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const doc = await Project.findById(id);
    if (!doc) return fail("That project no longer exists.");
    doc.status = status;
    if (status === "published" && !doc.publishedAt) doc.publishedAt = new Date();
    await doc.save();
    revalidatePublic({ project: doc.slug });
    return { ok: true, message: status === "published" ? "Published." : "Unpublished. It's now a draft." };
  } catch (err) {
    return handleError(err);
  }
}

export async function toggleProjectFeaturedAction(id: string, featured: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const res = await Project.updateOne({ _id: id }, { $set: { featured } });
    if (!res.matchedCount) return fail("That project no longer exists.");
    revalidatePublic();
    return { ok: true, message: featured ? "Featured on the homepage." : "Removed from featured." };
  } catch (err) {
    return handleError(err);
  }
}

export async function duplicateProjectAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    await connectDB();
    const src = await Project.findById(id).lean();
    if (!src) return fail("That project no longer exists.");
    const base = slugify(`${src.slug}-copy`);
    let slug = base;
    for (let i = 2; await Project.exists({ slug }); i++) slug = `${base}-${i}`;
    const rest = { ...src } as Record<string, unknown>;
    delete rest._id;
    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.__v;
    const copy = await Project.create({ ...rest, title: `${src.title} (copy)`, slug, status: "draft", featured: false, publishedAt: null });
    return { ok: true, data: { id: String(copy._id) }, message: "Duplicated as a draft." };
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const doc = await Project.findByIdAndDelete(id);
    if (!doc) return fail("That project was already deleted.");
    // Remove dangling references.
    await Promise.all([Project.updateMany({ relatedProjects: doc._id }, { $pull: { relatedProjects: doc._id } }), BlogPost.updateMany({ relatedProjects: doc._id }, { $pull: { relatedProjects: doc._id } })]);
    revalidatePublic({ project: doc.slug });
    return { ok: true, message: `Deleted “${doc.title}”.` };
  } catch (err) {
    return handleError(err);
  }
}

export async function reorderProjectsAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const valid = ids.filter((i) => Types.ObjectId.isValid(i)).slice(0, 500);
    await Project.bulkWrite(valid.map((_id, order) => ({ updateOne: { filter: { _id }, update: { $set: { order } } } })));
    revalidatePublic();
    return { ok: true, message: "Order saved." };
  } catch (err) {
    return handleError(err);
  }
}
