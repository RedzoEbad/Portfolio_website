import mongoose from "mongoose";

/** Loads .env.local / .env for CLI scripts (Next.js does this automatically for the app). */
export function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(f);
    } catch {
      /* file not present */
    }
  }
}

export async function connect() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✖ MONGODB_URI is not set. Add it to .env.local (see .env.example).");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "portfolio", serverSelectionTimeoutMS: 10000 });
  return mongoose;
}

export async function disconnect() {
  await mongoose.disconnect();
}
