"use client";

import { useState } from "react";
import { X } from "lucide-react";

/** Comma/Enter separated chips. */
export function TagInput({ value, onChange, placeholder, id, suggestions = [] }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; id?: string; suggestions?: string[] }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    onChange(Array.from(new Set([...value, ...parts])).slice(0, 30));
    setDraft("");
  };
  const listId = id ? `${id}-list` : undefined;
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-abyss/60 px-2 py-1.5 focus-within:border-signal focus-within:ring-2 focus-within:ring-signal/25">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-hull-2 px-2 py-0.5 font-mono text-xs">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="text-fog hover:text-flare" aria-label={`Remove ${t}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        list={listId}
        value={draft}
        onChange={(e) => {
          if (e.target.value.endsWith(",")) add(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-fog/70"
      />
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}
