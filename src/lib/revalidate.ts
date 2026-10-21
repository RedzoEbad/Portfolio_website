import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

/** Cache tags used by public Mongo queries (`unstable_cache`). */
export const CACHE_TAGS = {
  settings: "site-settings",
  categories: "categories",
  projects: "projects",
  posts: "posts",
  blogCategories: "blog-categories",
  timeline: "timeline",
  skills: "skills",
  certifications: "certifications",
  counts: "counts",
} as const;

/** Drop public HTML + tagged data after admin mutations. */
export function revalidatePublic(slug?: { project?: string; post?: string }) {
  revalidatePath("/", "layout");
  if (slug?.project) revalidatePath(`/projects/${slug.project}`);
  if (slug?.post) revalidatePath(`/blog/${slug.post}`);

  for (const tag of Object.values(CACHE_TAGS)) {
    revalidateTag(tag, "max");
  }
}
