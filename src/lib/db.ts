import "server-only";
import mongoose from "mongoose";
import { env } from "./env";

/**
 * Cached Mongoose connection. On Vercel each serverless instance reuses the
 * connection across invocations; in development the cache survives HMR.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const g = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = g.__mongoose ?? (g.__mongoose = { conn: null, promise: null });

mongoose.set("strictQuery", true);

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(env.mongoUri, {
      dbName: env.mongoDb,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      // Index builds are done once with `npm run db:init`, not on every cold start.
      autoIndex: !env.isProd,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
