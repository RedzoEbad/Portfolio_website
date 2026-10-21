import type { z } from "zod";
import type { blogPostSchema, projectSchema } from "../validation/schemas";
import { CASE_STUDY_SECTIONS } from "./constants";

/** Blank editor values, shared by server pages and client editors. */
export function emptyProject(): z.input<typeof projectSchema> {
  return {
    title: "", slug: "", summary: "", category: null, tags: [], technologies: [], githubUrl: "", demoUrl: "", coverImage: null, gallery: [], architectureImages: [],
    sections: CASE_STUDY_SECTIONS.map((s) => ({ type: s.type, title: s.title, enabled: true, content: "" })),
    implementationSteps: [], codeSnippets: [], relatedProjects: [], projectState: "completed", status: "draft", featured: false, order: 0,
    seo: { title: "", description: "", ogImage: "" },
  };
}

export function emptyPost(): z.input<typeof blogPostSchema> {
  return { title: "", slug: "", excerpt: "", coverImage: null, content: "", categories: [], tags: [], relatedProjects: [], status: "draft", featured: false, publishedAt: "", seo: { title: "", description: "", ogImage: "" } };
}
