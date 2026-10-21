import { z } from "zod";
import { CODE_LANGUAGES, PROJECT_STATES, PUBLICATION_STATUSES, SECTION_TYPES, STATUS_TONES, TIMELINE_KINDS } from "../content/constants";
import { ICON_KEYS } from "../content/icons";

/* Client-safe: these schemas validate forms in the browser AND every mutation on the server. */

const trimmed = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Add a slug.")
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.");

export const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Enter a full URL starting with https://")
  .default("");

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid reference.");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #2ee6f5.");

/** Remote https://… or a file uploaded to /uploads/… on this server. */
const imageUrl = z
  .string()
  .trim()
  .min(1, "Add an image URL or upload a file.")
  .max(2048)
  .refine(
    (v) => /^https?:\/\//i.test(v) || /^\/uploads\/[a-z0-9][a-z0-9/_.,+-]*$/i.test(v),
    "Use https://… or upload an image (saved under /uploads/).",
  );

export const imageSchema = z.object({
  url: imageUrl,
  alt: trimmed(300).default(""),
  caption: trimmed(500).default(""),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type ImageInput = z.infer<typeof imageSchema>;

const seoSchema = z.object({
  title: trimmed(120).default(""),
  description: trimmed(320).default(""),
  ogImage: optionalUrl,
});

export const loginSchema = z.object({
  email: z.email("Enter the admin email address.").max(200),
  password: z.string().min(1, "Enter your password.").max(200),
});

/* ---------- Categories ---------- */
export const categorySchema = z.object({
  name: trimmed(80).min(1, "Name the category."),
  slug,
  tagline: trimmed(140).default(""),
  description: trimmed(2000).default(""),
  icon: z.enum(ICON_KEYS as [string, ...string[]]).default("hexagon"),
  color: hex.default("#2ee6f5"),
  cover: imageSchema.nullable().default(null),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  showOnHome: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const blogCategorySchema = z.object({
  name: trimmed(80).min(1, "Name the category."),
  slug,
  description: trimmed(600).default(""),
  color: hex.default("#9d6bff"),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;

/* ---------- Projects ---------- */
export const sectionSchema = z.object({
  type: z.enum(SECTION_TYPES),
  title: trimmed(120).default(""),
  enabled: z.boolean().default(true),
  content: z.string().max(60000).default(""),
});

export const projectSchema = z.object({
  title: trimmed(140).min(1, "Give the project a title."),
  slug,
  summary: trimmed(400).default(""),
  category: objectId.nullable().or(z.literal("")).transform((v) => v || null),
  tags: z.array(trimmed(40).min(1)).max(30).default([]),
  technologies: z.array(z.object({ name: trimmed(60).min(1, "Name the technology."), role: trimmed(300).default("") })).max(60).default([]),
  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
  coverImage: imageSchema.nullable().default(null),
  gallery: z.array(imageSchema).max(40).default([]),
  architectureImages: z.array(imageSchema).max(20).default([]),
  sections: z.array(sectionSchema).max(40).default([]),
  implementationSteps: z.array(z.object({ title: trimmed(160).min(1, "Title this step."), body: z.string().max(20000).default("") })).max(60).default([]),
  codeSnippets: z
    .array(
      z.object({
        title: trimmed(140).default(""),
        language: z.enum(CODE_LANGUAGES).default("text"),
        code: z.string().min(1, "Paste the code.").max(20000),
        caption: trimmed(400).default(""),
      }),
    )
    .max(30)
    .default([]),
  relatedProjects: z.array(objectId).max(12).default([]),
  projectState: z.enum(PROJECT_STATES).default("completed"),
  status: z.enum(PUBLICATION_STATUSES).default("draft"),
  featured: z.boolean().default(false),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  seo: seoSchema.default({ title: "", description: "", ogImage: "" }),
});
export type ProjectInput = z.input<typeof projectSchema>;
export type ProjectParsed = z.output<typeof projectSchema>;

/* ---------- Blog ---------- */
export const blogPostSchema = z.object({
  title: trimmed(160).min(1, "Give the article a title."),
  slug,
  excerpt: trimmed(400).default(""),
  coverImage: imageSchema.nullable().default(null),
  content: z.string().max(200000).default(""),
  categories: z.array(objectId).max(10).default([]),
  tags: z.array(trimmed(40).min(1)).max(30).default([]),
  relatedProjects: z.array(objectId).max(10).default([]),
  status: z.enum(PUBLICATION_STATUSES).default("draft"),
  featured: z.boolean().default(false),
  /** ISO date string or "" (publish now when status becomes published). */
  publishedAt: z
    .string()
    .default("")
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date."),
  seo: seoSchema.default({ title: "", description: "", ogImage: "" }),
});
export type BlogPostInput = z.input<typeof blogPostSchema>;

/* ---------- Profile content ---------- */
export const skillSchema = z.object({
  name: trimmed(60).min(1, "Name the skill."),
  group: trimmed(60).min(1, "Choose a group.").default("General"),
  icon: z.string().max(40).default(""),
  note: trimmed(160).default(""),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

const dateString = z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date.");
const optionalDate = z.string().default("").refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date.");

export const certificationSchema = z.object({
  name: trimmed(140).min(1, "Name the certification."),
  issuer: trimmed(120).default(""),
  issuedAt: optionalDate,
  expiresAt: optionalDate,
  credentialUrl: optionalUrl,
  badge: imageSchema.nullable().default(null),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const timelineEventSchema = z.object({
  title: trimmed(140).min(1, "Title the milestone."),
  date: dateString,
  kind: z.enum(TIMELINE_KINDS).default("achievement"),
  description: trimmed(1200).default(""),
  link: optionalUrl,
  published: z.boolean().default(true),
});

/* ---------- Settings ---------- */
const navLink = z.object({
  label: trimmed(40).min(1, "Add a label."),
  href: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Use a site path like /projects or a full https:// URL."),
  enabled: z.boolean().default(true),
});

export const settingsSchema = z.object({
  siteName: trimmed(80).min(1, "Add a site name."),
  ownerName: trimmed(80).min(1, "Add your name."),
  role: trimmed(140).default(""),
  location: trimmed(120).default(""),
  avatar: imageSchema.nullable().default(null),
  hero: z.object({
    headline: trimmed(160).min(1, "Add a headline."),
    subheadline: trimmed(400).default(""),
    statusText: trimmed(120).default(""),
    statusTone: z.enum(STATUS_TONES).default("available"),
  }),
  about: z.object({ intro: trimmed(600).default(""), body: z.string().max(30000).default("") }),
  impact: z
    .array(
      z.object({
        title: trimmed(80).min(1, "Title this item."),
        description: trimmed(400).default(""),
        icon: z.string().max(40).default("hexagon"),
        metricValue: trimmed(24).default(""),
        metricLabel: trimmed(60).default(""),
      }),
    )
    .max(16)
    .default([]),
  socials: z.object({ github: optionalUrl, linkedin: optionalUrl, x: optionalUrl, website: optionalUrl }),
  contact: z.object({
    email: z.string().trim().max(200).refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email.").default(""),
    showEmail: z.boolean().default(false),
    formEnabled: z.boolean().default(true),
    note: trimmed(300).default(""),
  }),
  nav: z.array(navLink).max(12).default([]),
  home: z.object({
    showDomains: z.boolean(),
    showFeatured: z.boolean(),
    showImpact: z.boolean(),
    showTimeline: z.boolean(),
    showArticles: z.boolean(),
    showContact: z.boolean(),
    featuredLimit: z.coerce.number().int().min(1).max(12),
    articlesLimit: z.coerce.number().int().min(1).max(12),
  }),
  seo: z.object({
    title: trimmed(120).default(""),
    description: trimmed(320).default(""),
    ogImage: optionalUrl,
    keywords: z.array(trimmed(40)).max(30).default([]),
  }),
  footerNote: trimmed(300).default(""),
});
export type SettingsInput = z.input<typeof settingsSchema>;

/* ---------- Public contact form ---------- */
export const contactSchema = z.object({
  name: trimmed(120).min(2, "Add your name."),
  email: z.email("Enter an email address so I can reply.").max(200),
  subject: trimmed(200).default(""),
  message: trimmed(5000).min(20, "Write at least a couple of sentences (20+ characters)."),
  /** Honeypot: real people never fill this. */
  company: z.string().max(0).optional().default(""),
  /** Timestamp the form was rendered; submissions faster than 3s are rejected. */
  startedAt: z.coerce.number().int(),
});
export type ContactInput = z.input<typeof contactSchema>;

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(12, "Use at least 12 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords don't match.", path: ["confirm"] });
