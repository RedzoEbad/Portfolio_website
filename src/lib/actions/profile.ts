"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectDB } from "../db";
import { Certification, ContactMessage, SiteSettings, Skill, TimelineEvent } from "../models";
import { requireAdmin } from "../auth/guard";
import { certificationSchema, settingsSchema, skillSchema, timelineEventSchema } from "../validation/schemas";
import { fail, handleError, zodFail, type ActionResult } from "./result";
import { revalidatePublic } from "../revalidate";

type Kind = "skill" | "certification" | "timeline";
const MODELS = { skill: Skill, certification: Certification, timeline: TimelineEvent } as const;
const SCHEMAS = { skill: skillSchema, certification: certificationSchema, timeline: timelineEventSchema } as const;
const LABEL = { skill: "Skill", certification: "Certification", timeline: "Milestone" } as const;

function normalize(kind: Kind, data: Record<string, unknown>) {
  if (kind === "certification") {
    return { ...data, issuedAt: data.issuedAt ? new Date(String(data.issuedAt)) : null, expiresAt: data.expiresAt ? new Date(String(data.expiresAt)) : null };
  }
  if (kind === "timeline") return { ...data, date: new Date(String(data.date)) };
  return data;
}

export async function saveProfileItemAction(kind: Kind, id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    if (!(kind in MODELS)) return fail("Unknown content type.");
    const parsed = SCHEMAS[kind].safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    await connectDB();
    const Model = MODELS[kind] as unknown as typeof Skill;
    const data = normalize(kind, parsed.data as Record<string, unknown>);
    if (id && !Types.ObjectId.isValid(id)) return fail("That item no longer exists.");
    const doc = id ? await Model.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true }) : await Model.create(data);
    if (!doc) return fail("That item no longer exists.");
    revalidatePublic();
    return { ok: true, data: { id: String(doc._id) }, message: `${LABEL[kind]} ${id ? "updated" : "added"}.` };
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteProfileItemAction(kind: Kind, id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!(kind in MODELS)) return fail("Unknown content type.");
    await connectDB();
    const Model = MODELS[kind] as unknown as typeof Skill;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return fail("That item was already deleted.");
    revalidatePublic();
    return { ok: true, message: `${LABEL[kind]} deleted.` };
  } catch (err) {
    return handleError(err);
  }
}

export async function saveSettingsAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    await connectDB();
    await SiteSettings.findOneAndUpdate({ key: "site" }, { $set: parsed.data }, { upsert: true, runValidators: true });
    revalidatePublic();
    return { ok: true, message: "Settings saved. The public site is updated." };
  } catch (err) {
    return handleError(err);
  }
}

export async function setMessageReadAction(id: string, read: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await ContactMessage.updateOne({ _id: id }, { $set: { read } });
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteMessageAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await connectDB();
    await ContactMessage.deleteOne({ _id: id });
    revalidatePath("/admin/messages");
    return { ok: true, message: "Message deleted." };
  } catch (err) {
    return handleError(err);
  }
}
