import mongoose, { Schema, model, type InferSchemaType, type Model } from "mongoose";
import { PROJECT_STATES, PUBLICATION_STATUSES, SECTION_TYPES, STATUS_TONES, TIMELINE_KINDS } from "../content/constants";
import { ImageSchema, SeoSchema } from "./shared";

const { models } = mongoose;
function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (models[name] as Model<T>) || model<T>(name, schema);
}

/* ---------------- AdminUser ---------------- */
const AdminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "Administrator", trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "editor"], default: "owner" },
    /** Incremented to revoke every existing session for this user. */
    sessionVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
  },
  { timestamps: true },
);
export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema>;
export const AdminUser = getModel("AdminUser", AdminUserSchema);

/* ---------------- Category (engineering domains) ---------------- */
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, default: "", maxlength: 140 },
    description: { type: String, default: "", maxlength: 2000 },
    icon: { type: String, default: "hexagon" },
    color: { type: String, default: "#2ee6f5", match: /^#[0-9a-fA-F]{6}$/ },
    cover: { type: ImageSchema, default: null },
    order: { type: Number, default: 0 },
    showOnHome: { type: Boolean, default: true },
  },
  { timestamps: true },
);
CategorySchema.index({ order: 1, name: 1 });
export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category = getModel("Category", CategorySchema);

/* ---------------- Project ---------------- */
const SectionSchema = new Schema(
  {
    type: { type: String, enum: SECTION_TYPES, required: true },
    title: { type: String, default: "", maxlength: 120 },
    enabled: { type: Boolean, default: true },
    content: { type: String, default: "", maxlength: 60000 },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: "", maxlength: 400 },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    tags: { type: [String], default: [] },
    technologies: { type: [new Schema({ name: { type: String, required: true }, role: { type: String, default: "" } }, { _id: false })], default: [] },
    githubUrl: { type: String, default: "" },
    demoUrl: { type: String, default: "" },
    coverImage: { type: ImageSchema, default: null },
    /** Hero system-design / flow diagram shown before the case-study overview. */
    systemDesignImage: { type: ImageSchema, default: null },
    gallery: { type: [ImageSchema], default: [] },
    architectureImages: { type: [ImageSchema], default: [] },
    /** Ordered, toggleable case-study sections. Markdown for narrative sections; structured sections render from the fields below. */
    sections: { type: [SectionSchema], default: [] },
    implementationSteps: { type: [new Schema({ title: { type: String, required: true }, body: { type: String, default: "" } }, { _id: false })], default: [] },
    codeSnippets: {
      type: [new Schema({ title: String, language: { type: String, default: "text" }, code: { type: String, required: true, maxlength: 20000 }, caption: String }, { _id: false })],
      default: [],
    },
    relatedProjects: { type: [{ type: Schema.Types.ObjectId, ref: "Project" }], default: [] },
    projectState: { type: String, enum: PROJECT_STATES, default: "completed" },
    status: { type: String, enum: PUBLICATION_STATUSES, default: "draft" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    /** True for clearly-labelled development sample content. */
    isSample: { type: Boolean, default: false },
    seo: { type: SeoSchema, default: () => ({}) },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
ProjectSchema.index({ status: 1, featured: -1, order: 1, publishedAt: -1 });
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ "technologies.name": 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ title: "text", summary: "text", tags: "text", "technologies.name": "text" }, { weights: { title: 10, tags: 4, summary: 2 } });
export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;
export const Project = getModel("Project", ProjectSchema);

/* ---------------- Blog ---------------- */
const BlogCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", maxlength: 600 },
    color: { type: String, default: "#9d6bff" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const BlogCategory = getModel("BlogCategory", BlogCategorySchema);

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "", maxlength: 400 },
    coverImage: { type: ImageSchema, default: null },
    content: { type: String, default: "", maxlength: 200000 },
    categories: { type: [{ type: Schema.Types.ObjectId, ref: "BlogCategory" }], default: [] },
    tags: { type: [String], default: [] },
    readingMinutes: { type: Number, default: 1 },
    relatedProjects: { type: [{ type: Schema.Types.ObjectId, ref: "Project" }], default: [] },
    status: { type: String, enum: PUBLICATION_STATUSES, default: "draft" },
    featured: { type: Boolean, default: false },
    isSample: { type: Boolean, default: false },
    /** A published post with a future publishedAt is scheduled: it stays hidden until then. */
    publishedAt: { type: Date, default: null },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true },
);
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ categories: 1, status: 1, publishedAt: -1 });
BlogPostSchema.index({ title: "text", excerpt: "text", tags: "text" }, { weights: { title: 10, tags: 4, excerpt: 2 } });
export const BlogPost = getModel("BlogPost", BlogPostSchema);

/* ---------------- Profile content ---------------- */
const SkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    group: { type: String, default: "General", trim: true, maxlength: 60 },
    icon: { type: String, default: "" },
    note: { type: String, default: "", maxlength: 160 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
SkillSchema.index({ group: 1, order: 1 });
export const Skill = getModel("Skill", SkillSchema);

const CertificationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    issuer: { type: String, default: "", maxlength: 120 },
    issuedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    credentialUrl: { type: String, default: "" },
    badge: { type: ImageSchema, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export const Certification = getModel("Certification", CertificationSchema);

const TimelineEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    date: { type: Date, required: true },
    kind: { type: String, enum: TIMELINE_KINDS, default: "achievement" },
    description: { type: String, default: "", maxlength: 1200 },
    link: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
TimelineEventSchema.index({ date: -1 });
export const TimelineEvent = getModel("TimelineEvent", TimelineEventSchema);

/* ---------------- Site settings (singleton, key: "site") ---------------- */
const LinkSchema = new Schema({ label: { type: String, required: true }, href: { type: String, required: true }, enabled: { type: Boolean, default: true } }, { _id: false });

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    siteName: { type: String, default: "Ebad Khan" },
    ownerName: { type: String, default: "Ebad Khan" },
    role: { type: String, default: "Cloud and DevSecOps Engineer" },
    location: { type: String, default: "" },
    avatar: { type: ImageSchema, default: null },
    hero: {
      headline: { type: String, default: "Engineering the Cloud. Automating the Future." },
      subheadline: {
        type: String,
        default: "I build secure cloud infrastructure, reliable distributed systems, automated delivery pipelines, and intelligent AI-powered engineering solutions.",
      },
      statusText: { type: String, default: "Open to cloud and platform engineering roles" },
      statusTone: { type: String, enum: STATUS_TONES, default: "available" },
    },
    about: {
      intro: { type: String, default: "" },
      body: { type: String, default: "" },
    },
    impact: {
      type: [
        new Schema(
          {
            title: { type: String, required: true },
            description: { type: String, default: "" },
            icon: { type: String, default: "hexagon" },
            metricValue: { type: String, default: "" },
            metricLabel: { type: String, default: "" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    socials: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "https://www.linkedin.com/in/ebad-khan-b656153ba" },
      x: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    contact: {
      email: { type: String, default: "ebadkhan6292002@gmail.com" },
      showEmail: { type: Boolean, default: true },
      formEnabled: { type: Boolean, default: true },
      note: { type: String, default: "" },
    },
    nav: { type: [LinkSchema], default: [] },
    home: {
      showDomains: { type: Boolean, default: true },
      showFeatured: { type: Boolean, default: true },
      showImpact: { type: Boolean, default: true },
      showTimeline: { type: Boolean, default: true },
      showArticles: { type: Boolean, default: true },
      showContact: { type: Boolean, default: true },
      featuredLimit: { type: Number, default: 4 },
      articlesLimit: { type: Number, default: 3 },
    },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      keywords: { type: [String], default: [] },
    },
    footerNote: { type: String, default: "" },
  },
  { timestamps: true },
);
export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export const SiteSettings = getModel("SiteSettings", SiteSettingsSchema);

/* ---------------- Media, contact messages, rate limits ---------------- */
const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    provider: { type: String, default: "cloudinary" },
    width: Number,
    height: Number,
    bytes: Number,
    format: String,
    alt: { type: String, default: "" },
  },
  { timestamps: true },
);
export const Media = getModel("Media", MediaSchema);

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    subject: { type: String, default: "", maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
ContactMessageSchema.index({ createdAt: -1 });
export const ContactMessage = getModel("ContactMessage", ContactMessageSchema);

/** Fixed-window counters; a TTL index removes expired windows. Works across serverless instances. */
const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = getModel("RateLimit", RateLimitSchema);

export const ALL_MODELS = [AdminUser, Category, Project, BlogCategory, BlogPost, Skill, Certification, TimelineEvent, SiteSettings, Media, ContactMessage, RateLimit];
