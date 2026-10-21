import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { slugify } from "@/lib/utils";

/**
 * Safe Markdown: raw HTML is NOT rendered (no rehype-raw), and react-markdown's default
 * URL transform strips javascript: and other unsafe protocols. Admin content can't run scripts.
 */
function text(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(text).join("");
  if (children && typeof children === "object" && "props" in children) return text((children as { props: { children?: React.ReactNode } }).props.children);
  return "";
}

const components: Components = {
  h2: ({ children }) => <h2 id={slugify(text(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(text(children))}>{children}</h3>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}>
        {children}
      </a>
    );
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => (typeof src === "string" ? <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" /> : null),
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const match = /language-([\w-]+)/.exec(className ?? "");
    const raw = String(children ?? "");
    if (match || raw.includes("\n")) return <CodeBlock code={raw.replace(/\n$/, "")} language={match?.[1]} />;
    return <code>{children}</code>;
  },
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
};

export function Markdown({ source, className }: { source: string; className?: string }) {
  if (!source?.trim()) return null;
  return (
    <div className={className ?? "prose-lab"}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
