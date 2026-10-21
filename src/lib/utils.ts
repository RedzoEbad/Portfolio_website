import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/** ~225 wpm; code blocks counted at half speed. */
export function readingTime(markdown: string): number {
  const words = markdown.replace(/```[\s\S]*?```/g, (m) => " ".repeat(Math.ceil(m.length / 2))).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatDate(d?: string | Date | null, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", opts).format(date);
}

export function isSafeHttpUrl(u?: string | null): u is string {
  if (!u) return false;
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function hostOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}
