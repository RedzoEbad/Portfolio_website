"use client";

import { useRef, useState } from "react";
import { Bold, Code, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, SquareCode } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/content/markdown";
import { uploadImage } from "./image-field";
import { cn } from "@/lib/utils";

type Op = { icon: React.ComponentType<{ className?: string }>; label: string; wrap?: [string, string]; line?: string; block?: string };
const OPS: Op[] = [
  { icon: Heading2, label: "Heading", line: "## " },
  { icon: Heading3, label: "Subheading", line: "### " },
  { icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", wrap: ["_", "_"] },
  { icon: Code, label: "Inline code", wrap: ["`", "`"] },
  { icon: List, label: "Bulleted list", line: "- " },
  { icon: ListOrdered, label: "Numbered list", line: "1. " },
  { icon: Quote, label: "Quote", line: "> " },
  { icon: Link2, label: "Link", wrap: ["[", "](https://)"] },
  { icon: SquareCode, label: "Code block", block: "```bash\n\n```" },
];

/** Markdown with a formatting toolbar, live preview (same renderer as the public site), and image upload. */
export function MarkdownEditor({ value, onChange, rows = 10, id, uploadsEnabled: _uploadsEnabled, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; id?: string; uploadsEnabled?: boolean; placeholder?: string }) {
  void _uploadsEnabled;
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);

  const insert = (op: Op | { block: string }) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = value.slice(s, e);
    let next = value;
    let caret = s;
    if ("wrap" in op && op.wrap) {
      next = value.slice(0, s) + op.wrap[0] + (sel || "text") + op.wrap[1] + value.slice(e);
      caret = s + op.wrap[0].length + (sel || "text").length;
    } else if ("line" in op && op.line) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      next = value.slice(0, lineStart) + op.line + value.slice(lineStart);
      caret = e + op.line.length;
    } else if (op.block) {
      const pre = s > 0 && value[s - 1] !== "\n" ? "\n\n" : "";
      next = value.slice(0, s) + pre + op.block + "\n" + value.slice(e);
      caret = s + pre.length + op.block.indexOf("\n") + 1;
    }
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-abyss/60 focus-within:border-signal">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-1.5 py-1">
        <div className="mr-2 flex rounded-md bg-hull-2 p-0.5 text-xs" role="tablist" aria-label="Editor mode">
          {(["write", "preview"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded px-2.5 py-1 capitalize", tab === t ? "bg-hull text-frost shadow" : "text-fog")}>
              {t}
            </button>
          ))}
        </div>
        {tab === "write" &&
          OPS.map((op) => (
            <button key={op.label} type="button" onClick={() => insert(op)} className="rounded p-1.5 text-fog hover:bg-hull-2 hover:text-frost" title={op.label} aria-label={op.label}>
              <op.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        {tab === "write" && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                try {
                  const img = await uploadImage(f);
                  insert({ block: `![Describe the image](${img.url})` });
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded p-1.5 text-fog hover:bg-hull-2 hover:text-frost"
              title="Upload and insert image"
              aria-label="Insert image"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            </button>
          </>
        )}
        <span className="ml-auto px-2 text-[11px] text-fog">Markdown</span>
      </div>
      {tab === "write" ? (
        <textarea ref={ref} id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="block w-full resize-y bg-transparent px-3 py-2.5 font-mono text-[13px] leading-relaxed outline-none placeholder:text-fog/60" />
      ) : (
        <div className="min-h-40 px-4 py-3">{value.trim() ? <Markdown source={value} /> : <p className="text-sm text-fog">Nothing to preview yet.</p>}</div>
      )}
    </div>
  );
}
