"use server";

import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { connectDB } from "../db";
import { env } from "../env";
import { Media } from "../models";
import { requireAdmin } from "../auth/guard";
import { fail, handleError, type ActionResult } from "./result";
import type { ImageInput } from "../validation/schemas";

const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,avif";
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_BYTES = 10 * 1024 * 1024;

export type UploadTicket = { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string; allowedFormats: string };

/**
 * Issues a short-lived signed upload ticket. The browser uploads straight to Cloudinary,
 * so files never pass through (or get stored on) the Vercel function.
 */
export async function signUploadAction(): Promise<ActionResult<UploadTicket>> {
  try {
    await requireAdmin();
    const cfg = env.cloudinary;
    if (!cfg) return fail("Image uploads aren't configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or paste an image URL instead.");
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { allowed_formats: ALLOWED_FORMATS, folder: cfg.folder, timestamp: String(timestamp) };
    const toSign = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    const signature = createHash("sha1").update(toSign + cfg.apiSecret).digest("hex");
    return { ok: true, data: { cloudName: cfg.cloudName, apiKey: cfg.apiKey, timestamp, signature, folder: cfg.folder, allowedFormats: ALLOWED_FORMATS } };
  } catch (err) {
    return handleError(err);
  }
}

const mediaSchema = z.object({
  url: z.string().url().refine((u) => new URL(u).hostname === "res.cloudinary.com", "Only Cloudinary uploads are recorded."),
  publicId: z.string().max(300),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().nonnegative().optional(),
  format: z.string().max(20).optional(),
});

export async function recordMediaAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = mediaSchema.parse(input);
    await connectDB();
    await Media.create({ ...data, provider: "cloudinary" });
    return { ok: true };
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Saves an image under public/uploads when Cloudinary isn't configured.
 * Local-only: Vercel has no persistent disk, so uploads must use Cloudinary there.
 */
export async function uploadLocalImageAction(formData: FormData): Promise<ActionResult<ImageInput>> {
  try {
    await requireAdmin();
    if (process.env.VERCEL) {
      return fail(
        "On Vercel, images must use Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Project → Settings → Environment Variables, redeploy, then re-upload your screenshots.",
      );
    }
    const file = formData.get("file");
    if (!(file instanceof File)) return fail("Choose an image file to upload.");
    if (!ALLOWED_MIME[file.type]) return fail("Choose an image file (PNG, JPG, WebP, GIF or AVIF).");
    if (file.size <= 0 || file.size > MAX_BYTES) return fail("Images must be between 1 byte and 10 MB.");

    const ext = ALLOWED_MIME[file.type];
    const now = new Date();
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const dir = path.join(process.cwd(), "public", "uploads", y, m);
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), bytes);

    const url = `/uploads/${y}/${m}/${filename}`;
    try {
      await connectDB();
      await Media.create({ url, publicId: filename, bytes: file.size, format: ext, provider: "local" });
    } catch {
      /* Media log is best-effort; the file is already on disk. */
    }

    return { ok: true, data: { url, alt: "", caption: "" } };
  } catch (err) {
    return handleError(err);
  }
}
