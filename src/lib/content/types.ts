/** Plain, serialisable shapes passed from the server to components. */
import type { SectionType } from "./constants";

export type Img = { url: string; alt?: string; caption?: string; width?: number; height?: number };
export type Seo = { title?: string; description?: string; ogImage?: string };

export type CategoryDTO = {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  cover: Img | null;
  order: number;
  showOnHome: boolean;
  projectCount?: number;
};

export type ProjectSection = { type: SectionType; title: string; enabled: boolean; content: string };

export type ProjectDTO = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: CategoryDTO | null;
  tags: string[];
  technologies: { name: string; role: string }[];
  githubUrl: string;
  demoUrl: string;
  coverImage: Img | null;
  systemDesignImage: Img | null;
  gallery: Img[];
  architectureImages: Img[];
  sections: ProjectSection[];
  implementationSteps: { title: string; body: string }[];
  codeSnippets: { title?: string; language: string; code: string; caption?: string }[];
  relatedProjects: string[];
  projectState: string;
  status: "draft" | "published";
  featured: boolean;
  order: number;
  isSample: boolean;
  seo: Seo;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectCardDTO = Pick<
  ProjectDTO,
  "_id" | "title" | "slug" | "summary" | "category" | "technologies" | "githubUrl" | "demoUrl" | "coverImage" | "projectState" | "featured" | "isSample" | "publishedAt"
> & { hasCaseStudy: boolean };

export type BlogCategoryDTO = { _id: string; name: string; slug: string; description: string; color: string; order: number; postCount?: number };

export type BlogPostDTO = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: Img | null;
  content: string;
  categories: BlogCategoryDTO[];
  tags: string[];
  readingMinutes: number;
  relatedProjects: string[];
  status: "draft" | "published";
  featured: boolean;
  isSample: boolean;
  publishedAt: string | null;
  seo: Seo;
  createdAt: string;
  updatedAt: string;
};

export type BlogCardDTO = Pick<BlogPostDTO, "_id" | "title" | "slug" | "excerpt" | "coverImage" | "categories" | "readingMinutes" | "publishedAt" | "featured" | "isSample">;

export type SettingsDTO = {
  siteName: string;
  ownerName: string;
  role: string;
  location: string;
  avatar: Img | null;
  hero: { headline: string; subheadline: string; statusText: string; statusTone: "available" | "busy" | "learning" | "hidden" };
  about: { intro: string; body: string };
  impact: { title: string; description: string; icon: string; metricValue: string; metricLabel: string }[];
  socials: { github: string; linkedin: string; x: string; website: string };
  contact: { email: string; showEmail: boolean; formEnabled: boolean; note: string };
  nav: { label: string; href: string; enabled: boolean }[];
  home: {
    showDomains: boolean;
    showFeatured: boolean;
    showImpact: boolean;
    showTimeline: boolean;
    showArticles: boolean;
    showContact: boolean;
    featuredLimit: number;
    articlesLimit: number;
  };
  seo: { title: string; description: string; ogImage: string; keywords: string[] };
  footerNote: string;
  updatedAt?: string;
};

export type TimelineDTO = { _id: string; title: string; date: string; kind: string; description: string; link: string; published: boolean };
export type SkillDTO = { _id: string; name: string; group: string; icon: string; note: string; order: number };
export type CertificationDTO = { _id: string; name: string; issuer: string; issuedAt: string | null; expiresAt: string | null; credentialUrl: string; badge: Img | null; order: number };

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; pages: number };
