/** Shared, client-safe content constants. */

export const CASE_STUDY_SECTIONS = [
  { type: "overview", title: "Project overview", kind: "markdown", hint: "What the project does, in a few paragraphs." },
  { type: "problem", title: "Problem statement", kind: "markdown", hint: "The real engineering problem you set out to solve." },
  { type: "goals", title: "Goals and requirements", kind: "markdown", hint: "What you aimed to achieve; constraints you worked within." },
  { type: "architecture", title: "Architecture", kind: "markdown", hint: "The system design and how the components connect. Architecture images render below this text." },
  { type: "stack", title: "Technology stack", kind: "structured", hint: "Rendered from the Technologies list on the Basics tab, with each tool's role." },
  { type: "implementation", title: "Implementation journey", kind: "structured", hint: "Rendered from the Implementation steps editor." },
  { type: "code", title: "Code examples", kind: "structured", hint: "Rendered from the Code snippets editor." },
  { type: "screenshots", title: "Screenshots", kind: "structured", hint: "Rendered from the Screenshots gallery on the Media tab." },
  { type: "diagrams", title: "Architecture diagrams", kind: "structured", hint: "Rendered from Architecture diagrams on the Media tab." },
  { type: "challenges", title: "Engineering challenges", kind: "markdown", hint: "Problems you hit and how you investigated them." },
  { type: "solutions", title: "Solutions", kind: "markdown", hint: "How you resolved those problems." },
  { type: "security", title: "Security considerations", kind: "markdown", hint: "IAM, secrets management, network controls, scanning." },
  { type: "observability", title: "Observability and reliability", kind: "markdown", hint: "Metrics, logs, traces, alerts, scaling and recovery." },
  { type: "lessons", title: "What I learned", kind: "markdown", hint: "Specific technical lessons and concepts." },
  { type: "outcomes", title: "Outcomes", kind: "markdown", hint: "Actual results, verified metrics, deliverables and limitations." },
  { type: "future", title: "Future improvements", kind: "markdown", hint: "What you'd change in the next iteration." },
  { type: "links", title: "Repository and demo", kind: "structured", hint: "Rendered from the GitHub and demo URLs." },
  { type: "related", title: "Related projects", kind: "structured", hint: "Chosen related projects, or projects in the same category." },
] as const;

export type SectionType = (typeof CASE_STUDY_SECTIONS)[number]["type"];
export const SECTION_TYPES = CASE_STUDY_SECTIONS.map((s) => s.type) as [SectionType, ...SectionType[]];
export const sectionMeta = (type: string) => CASE_STUDY_SECTIONS.find((s) => s.type === type);

export const PUBLICATION_STATUSES = ["draft", "published"] as const;
export const PROJECT_STATES = ["completed", "in-progress", "maintained", "experimental", "archived"] as const;
export const PROJECT_STATE_LABEL: Record<(typeof PROJECT_STATES)[number], string> = {
  completed: "Completed",
  "in-progress": "In progress",
  maintained: "Actively maintained",
  experimental: "Experimental",
  archived: "Archived",
};

export const TIMELINE_KINDS = ["certification", "project", "skill", "lesson", "achievement", "role", "education"] as const;

export const STATUS_TONES = ["available", "busy", "learning", "hidden"] as const;

export const CODE_LANGUAGES = [
  "bash", "hcl", "yaml", "json", "typescript", "javascript", "python", "go", "rust", "dockerfile", "sql", "text",
] as const;

export const CATEGORY_COLORS = ["#2ee6f5", "#9d6bff", "#4f8cff", "#2dd4bf", "#e2559c", "#f5b84a", "#7ee0b5", "#ff7a59"] as const;
