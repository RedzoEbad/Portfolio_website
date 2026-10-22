/**
 * Defaults used when settings have never been saved. They contain no claims about
 * the site owner beyond the copy in the brief: no metrics, no employers, no dates.
 */
export const DEFAULT_SOCIALS = {
  github: "",
  linkedin: "https://www.linkedin.com/in/ebad-khan-b656153ba",
  x: "",
  website: "",
} as const;

export const DEFAULT_CONTACT = {
  email: "ebadkhan6292002@gmail.com",
  showEmail: true,
  formEnabled: true,
  note: "",
} as const;

export const DEFAULT_NAV = [
  { label: "Projects", href: "/projects", enabled: true },
  { label: "Domains", href: "/#domains", enabled: true },
  { label: "Blog", href: "/blog", enabled: true },
  { label: "About", href: "/about", enabled: true },
  { label: "Contact", href: "/contact", enabled: true },
];

export const DEFAULT_IMPACT = [
  { title: "Infrastructure automation", description: "Turning click-ops into reviewed, versioned Terraform and pipelines.", icon: "layers", metricValue: "", metricLabel: "" },
  { title: "Reliable deployments", description: "Progressive delivery, rollbacks that work, and pipelines people trust.", icon: "rocket", metricValue: "", metricLabel: "" },
  { title: "Kubernetes operations", description: "Cluster design, workload tuning, upgrades and day-2 operations.", icon: "container", metricValue: "", metricLabel: "" },
  { title: "Observability and incidents", description: "Metrics, logs and traces wired up so incidents can be investigated, not guessed at.", icon: "activity", metricValue: "", metricLabel: "" },
  { title: "Security and policy", description: "Image scanning, least-privilege IAM and policy-as-code in the delivery path.", icon: "shield-check", metricValue: "", metricLabel: "" },
  { title: "Multi-cloud architecture", description: "Designs that hold up across providers without lowest-common-denominator compromises.", icon: "cloud", metricValue: "", metricLabel: "" },
  { title: "AI-assisted operations", description: "Agents that read telemetry, propose fixes and keep a human in the loop.", icon: "bot", metricValue: "", metricLabel: "" },
];

/** The eight domains named in the brief. Created by `npm run db:init` only if no categories exist. */
export const DEFAULT_DOMAINS = [
  { name: "Cloud Engineering", slug: "cloud-engineering", icon: "cloud", color: "#2ee6f5", tagline: "AWS architecture, networking and managed services." },
  { name: "DevOps and Platform Engineering", slug: "devops-platform-engineering", icon: "workflow", color: "#4f8cff", tagline: "CI/CD, internal platforms and developer experience." },
  { name: "Site Reliability Engineering", slug: "sre", icon: "activity", color: "#2dd4bf", tagline: "SLOs, incident response and resilient systems." },
  { name: "Kubernetes and Container Orchestration", slug: "kubernetes", icon: "container", color: "#67b7ff", tagline: "Clusters, workloads, operators and GitOps." },
  { name: "Infrastructure as Code", slug: "infrastructure-as-code", icon: "layers", color: "#9d6bff", tagline: "Terraform modules, policy and drift control." },
  { name: "Cloud Security and DevSecOps", slug: "cloud-security-devsecops", icon: "shield-check", color: "#e2559c", tagline: "IAM, secrets, scanning and guardrails in the pipeline." },
  { name: "Full-Stack Development", slug: "full-stack-development", icon: "code", color: "#f5b84a", tagline: "Product-grade web apps, APIs and data models." },
  { name: "Agentic AI and AI Infrastructure", slug: "agentic-ai", icon: "brain", color: "#b78cff", tagline: "LLM agents, tool use and the infrastructure behind them." },
].map((d, i) => ({ ...d, description: "", order: i, showOnHome: true }));
