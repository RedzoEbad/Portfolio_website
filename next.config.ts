import type { NextConfig } from "next";

/**
 * Remote image hosts that the Next.js image optimizer is allowed to fetch from.
 * Cloudinary is always allowed. Add more with IMAGE_REMOTE_HOSTS (comma separated),
 * e.g. IMAGE_REMOTE_HOSTS=images.unsplash.com,raw.githubusercontent.com
 * Images from any other host still render, just without optimization (see SmartImage).
 */
const extraHosts = (process.env.IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const optimizedHosts = ["res.cloudinary.com", ...extraHosts];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev only: extra hosts allowed to load dev assets (e.g. testing from another device on your LAN).
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS ?? "").split(",").map((h) => h.trim()).filter(Boolean),
  env: {
    NEXT_PUBLIC_OPTIMIZED_IMAGE_HOSTS: optimizedHosts.join(","),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: optimizedHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  serverExternalPackages: ["mongoose", "bcryptjs"],
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
