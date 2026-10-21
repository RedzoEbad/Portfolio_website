import { highlight } from "sugar-high";
import { CopyButton } from "./copy-button";

/** Server-highlighted code (no client JS except the copy button). */
export function CodeBlock({ code, language, title, caption }: { code: string; language?: string; title?: string; caption?: string }) {
  const lang = language && language !== "text" ? language : "";
  // sugar-high returns escaped HTML spans for the given source, so admin input can't inject markup.
  const html = highlight(code);
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-line-strong bg-[#070b1a]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </span>
          {title && <span className="truncate font-mono text-xs text-[#c8d3ee]">{title}</span>}
          {lang && <span className="font-mono text-[11px] text-[#7d89a8]">{lang}</span>}
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="sh overflow-x-auto p-4 text-[13px] leading-relaxed text-[#dce4f7]">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
      {caption && <figcaption className="border-t border-white/10 px-4 py-2 text-xs text-[#93a0bf]">{caption}</figcaption>}
    </figure>
  );
}
