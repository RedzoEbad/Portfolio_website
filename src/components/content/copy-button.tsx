"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-[#93a0bf] transition-colors hover:bg-white/10 hover:text-white"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[#2ee6f5]" /> : <Copy className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
