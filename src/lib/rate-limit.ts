import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { connectDB } from "./db";
import { RateLimit } from "./models";

/**
 * Fixed-window rate limit stored in MongoDB so it holds across serverless instances.
 * Returns { ok:false, retryAfter } once `limit` hits are recorded in `windowSeconds`.
 */
export async function rateLimit(bucket: string, id: string, limit: number, windowSeconds: number) {
  await connectDB();
  const key = `${bucket}:${createHash("sha256").update(id).digest("hex").slice(0, 32)}`;
  const now = new Date();
  // Reset expired window (the TTL monitor only runs every 60s).
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowSeconds * 1000) } },
    { upsert: true, returnDocument: "after" },
  ).lean();
  const ok = (doc?.count ?? 1) <= limit;
  const retryAfter = doc ? Math.max(0, Math.ceil((new Date(doc.expiresAt).getTime() - now.getTime()) / 1000)) : windowSeconds;
  return { ok, retryAfter, key };
}

export async function clearRateLimit(key: string) {
  await RateLimit.deleteOne({ key });
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
