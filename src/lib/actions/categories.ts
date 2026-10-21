"use server";

import { Types } from "mongoose";
import { connectDB } from "../db";
import { BlogCategory, BlogPost, Category, Project } from "../models";
import { requireAdmin } from "../auth/guard";
import { blogCategorySchema, categorySchema } from "../validation/schemas";
import { fail, handleError, zodFail, type ActionResult } from "./result";
import { revalidatePublic } from "../revalidate";

/* ---------- Engineering categories ---------- */
export async function saveCategoryAction(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    await connectDB();
    if (await Category.exists({ slug: parsed.data.slug, ...(id ? { _id: { $ne: id } } : {}) })) return fail("Another category already uses this slug.", { slug: "Already in use." });
    let doc;
    if (id) {
      doc = await Category.findByIdAndUpdate(id, parsed.data, { returnDocument: "after", runValidators: true });
      if (!doc) return fail("That category no longer exists.");
    } else {
      const order = parsed.data.order || (await Category.countDocuments());
      doc = await Category.create({ ...parsed.data, order });
    }
    revalidatePublic();
    return { ok: true, data: { id: String(doc._id) }, message: id ? "Category updated." : `Created “${doc.name}”. It now appears in navigation and filters.` };
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Deletes a category. If projects use it, `reassignTo` must be another category id,
 * or the literal "none" to leave those projects uncategorised.
 */
export async function deleteCategoryAction(id: string, reassignTo?: string | null): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const cat = await Category.findById(id);
    if (!cat) return fail("That category was already deleted.");
    const inUse = await Project.countDocuments({ category: cat._id });
    if (inUse > 0) {
      if (!reassignTo) return fail(`${inUse} project${inUse === 1 ? " uses" : "s use"} this category. Choose where to move ${inUse === 1 ? "it" : "them"} first.`);
      if (reassignTo === "none") {
        await Project.updateMany({ category: cat._id }, { $set: { category: null } });
      } else {
        if (!Types.ObjectId.isValid(reassignTo) || reassignTo === id || !(await Category.exists({ _id: reassignTo }))) return fail("Choose a different, existing category to move the projects to.");
        await Project.updateMany({ category: cat._id }, { $set: { category: new Types.ObjectId(reassignTo) } });
      }
    }
    await cat.deleteOne();
    revalidatePublic();
    return { ok: true, message: inUse ? `Deleted “${cat.name}” and moved ${inUse} project${inUse === 1 ? "" : "s"}.` : `Deleted “${cat.name}”.` };
  } catch (err) {
    return handleError(err);
  }
}

export async function reorderCategoriesAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const valid = ids.filter((i) => Types.ObjectId.isValid(i)).slice(0, 200);
    await Category.bulkWrite(valid.map((_id, order) => ({ updateOne: { filter: { _id }, update: { $set: { order } } } })));
    revalidatePublic();
    return { ok: true, message: "Order saved." };
  } catch (err) {
    return handleError(err);
  }
}

/* ---------- Blog categories ---------- */
export async function saveBlogCategoryAction(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = blogCategorySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    await connectDB();
    if (await BlogCategory.exists({ slug: parsed.data.slug, ...(id ? { _id: { $ne: id } } : {}) })) return fail("Another blog category already uses this slug.", { slug: "Already in use." });
    const doc = id ? await BlogCategory.findByIdAndUpdate(id, parsed.data, { returnDocument: "after", runValidators: true }) : await BlogCategory.create(parsed.data);
    if (!doc) return fail("That category no longer exists.");
    revalidatePublic();
    return { ok: true, data: { id: String(doc._id) }, message: id ? "Blog category updated." : `Created “${doc.name}”.` };
  } catch (err) {
    return handleError(err);
  }
}

/** Posts can belong to several categories, so deleting just removes the tag; optionally move them to another. */
export async function deleteBlogCategoryAction(id: string, reassignTo?: string | null): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const cat = await BlogCategory.findById(id);
    if (!cat) return fail("That category was already deleted.");
    if (reassignTo && reassignTo !== "none") {
      if (!Types.ObjectId.isValid(reassignTo) || reassignTo === id || !(await BlogCategory.exists({ _id: reassignTo }))) return fail("Choose a different, existing category.");
      await BlogPost.updateMany({ categories: cat._id }, { $addToSet: { categories: new Types.ObjectId(reassignTo) } });
    }
    const res = await BlogPost.updateMany({ categories: cat._id }, { $pull: { categories: cat._id } });
    await cat.deleteOne();
    revalidatePublic();
    return { ok: true, message: `Deleted “${cat.name}”${res.modifiedCount ? ` and updated ${res.modifiedCount} article${res.modifiedCount === 1 ? "" : "s"}` : ""}.` };
  } catch (err) {
    return handleError(err);
  }
}

export async function reorderBlogCategoriesAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    const valid = ids.filter((i) => Types.ObjectId.isValid(i)).slice(0, 200);
    await BlogCategory.bulkWrite(valid.map((_id, order) => ({ updateOne: { filter: { _id }, update: { $set: { order } } } })));
    revalidatePublic();
    return { ok: true, message: "Order saved." };
  } catch (err) {
    return handleError(err);
  }
}
