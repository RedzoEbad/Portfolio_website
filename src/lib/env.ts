import "server-only";

/** Server-only environment access with clear errors. Never import from client code. */
function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and set it (see README → Environment variables).`,
    );
  }
  return v;
}

export const env = {
  get mongoUri() {
    return required("MONGODB_URI");
  },
  get mongoDb() {
    return process.env.MONGODB_DB || "portfolio";
  },
  get authSecret() {
    const s = required("AUTH_SECRET");
    if (s.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 48");
    return s;
  },
  get cloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "portfolio" };
  },
  isProd: process.env.NODE_ENV === "production",
};

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}
