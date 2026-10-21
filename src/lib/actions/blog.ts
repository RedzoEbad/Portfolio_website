"use server";

import { Types } from "mongoose";
import { connectDB } from "../db";
import { BlogPost } from "../models";
import { requireAdmin } from "../auth/guard";
import { blogPostSchema } from "../validation/schemas";
import { readingTime, slugify } from "../utils";
import { fail, handleError, zodFail, type ActionResult } from "./result";
import { revalidatePublic } from "../revalidate";

export async function savePostAction(id: string | null, input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const parsed = blogPostSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = parsed.data;
    await connectDB();
    if (id && !Types.ObjectId.isValid(id)) return fail("That article no longer exists.");
    if (await BlogPost.exists({ slug: data.slug, ...(id ? { _id: { $ne: id } } : {}) })) return fail("Another article already uses this slug.", { slug: "Already in use." });

    const existing = id ? await BlogPost.findById(id) : null;
    if (id && !existing) return fail("That article no longer exists.");

    let publishedAt: Date | null = data.publishedAt ? new Date(data.publishedAt) : (existing?.publishedAt ?? null);
    if (data.status === "published" && !publishedAt) publishedAt = new Date();

    const doc = existing ?? new BlogPost();
    doc.set({ ...data, publishedAt, readingMinutes: readingTime(data.content) });
    await doc.save();
    revalidatePublic({ post: doc.slug });

    const scheduled = data.status === "published" && publishedAt && publishedAt > new Date();
    return {
      ok: true,
      data: { id: String(doc._id), slug: doc.slug },
      message: scheduled ? `Scheduled for ${publishedAt!.toLocaleString("en")}.` : data.status === "published" ? "Article saved and published." : "Draft saved.",
    };
  } catch (err) {
    return handleError(err);
  }
}

export async function setPostStatusAction(id: string, status: "draft" | "published"): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const doc = await BlogPost.findById(id);
    if (!doc) return fail("That article no longer exists.");
    doc.status = status;
    if (status === "published" && !doc.publishedAt) doc.publishedAt = new Date();
    await doc.save();
    revalidatePublic({ post: doc.slug });
    return { ok: true, message: status === "published" ? "Published." : "Unpublished. It's now a draft." };
  } catch (err) {
    return handleError(err);
  }
}

export async function duplicatePostAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    await connectDB();
    const src = await BlogPost.findById(id).lean();
    if (!src) return fail("That article no longer exists.");
    const base = slugify(`${src.slug}-copy`);
    let slug = base;
    for (let i = 2; await BlogPost.exists({ slug }); i++) slug = `${base}-${i}`;
    const rest = { ...src } as Record<string, unknown>;
    delete rest._id;
    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.__v;
    const copy = await BlogPost.create({ ...rest, title: `${src.title} (copy)`, slug, status: "draft", featured: false, publishedAt: null });
    return { ok: true, data: { id: String(copy._id) }, message: "Duplicated as a draft." };
  } catch (err) {
    return handleError(err);
  }
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const doc = await BlogPost.findByIdAndDelete(id);
    if (!doc) return fail("That article was already deleted.");
    revalidatePublic({ post: doc.slug });
    return { ok: true, message: `Deleted “${doc.title}”.` };
  } catch (err) {
    return handleError(err);
  }
}
