"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { certificationSchema, skillSchema, timelineEventSchema } from "@/lib/validation/schemas";
import { deleteProfileItemAction, saveProfileItemAction } from "@/lib/actions/profile";
import { TIMELINE_KINDS } from "@/lib/content/constants";
import { ICON_KEYS, iconFor } from "@/lib/content/icons";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { ImageField } from "./image-field";
import { ActionButton } from "./confirm";
import { formatDate } from "@/lib/utils";

type Kind = "skill" | "certification" | "timeline";
type FieldDef = { name: string; label: string; type: "text" | "textarea" | "date" | "number" | "select" | "switch" | "image" | "icon"; options?: readonly string[]; hint?: string; placeholder?: string; full?: boolean };

/* eslint-disable @typescript-eslint/no-explicit-any */
const CONFIG: Record<Kind, { schema: any; noun: string; fields: FieldDef[]; empty: Record<string, unknown>; summary: (i: any) => { title: string; meta: string } }> = {
  timeline: {
    schema: timelineEventSchema,
    noun: "milestone",
    empty: { title: "", date: "", kind: "achievement", description: "", link: "", published: true },
    fields: [
      { name: "title", label: "Title", type: "text", full: true },
      { name: "date", label: "Date", type: "date" },
      { name: "kind", label: "Type", type: "select", options: TIMELINE_KINDS },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "link", label: "Link (optional)", type: "text", placeholder: "https://…", full: true },
      { name: "published", label: "Show on the site", type: "switch" },
    ],
    summary: (i) => ({ title: i.title, meta: `${formatDate(i.date, { year: "numeric", month: "short" })} · ${i.kind}${i.published ? "" : " · hidden"}` }),
  },
  skill: {
    schema: skillSchema,
    noun: "skill",
    empty: { name: "", group: "Cloud", icon: "", note: "", order: 0 },
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "group", label: "Group", type: "text", hint: "Skills are grouped by this label, e.g. Cloud, IaC, Observability." },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "order", label: "Order in group", type: "number" },
      { name: "note", label: "Note (optional)", type: "text", hint: "Shown as a tooltip.", full: true },
    ],
    summary: (i) => ({ title: i.name, meta: i.group }),
  },
  certification: {
    schema: certificationSchema,
    noun: "certification",
    empty: { name: "", issuer: "", issuedAt: "", expiresAt: "", credentialUrl: "", badge: null, order: 0 },
    fields: [
      { name: "name", label: "Name", type: "text", full: true },
      { name: "issuer", label: "Issuer", type: "text" },
      { name: "order", label: "Order", type: "number" },
      { name: "issuedAt", label: "Issued", type: "date" },
      { name: "expiresAt", label: "Expires (optional)", type: "date" },
      { name: "credentialUrl", label: "Verification URL", type: "text", placeholder: "https://…", full: true, hint: "Link to the issuer's verification page so visitors can check it." },
      { name: "badge", label: "Badge image", type: "image", full: true },
    ],
    summary: (i) => ({ title: i.name, meta: [i.issuer, i.issuedAt && formatDate(i.issuedAt, { year: "numeric", month: "short" })].filter(Boolean).join(" · ") }),
  },
};

const dateOnly = (v?: string | null) => (v ? String(v).slice(0, 10) : "");

function ItemForm({ kind, item, onDone, uploadsEnabled }: { kind: Kind; item: any | null; onDone: (saved: boolean) => void; uploadsEnabled: boolean }) {
  const cfg = CONFIG[kind];
  const [pending, start] = useTransition();
  const defaults = item ? { ...cfg.empty, ...item, date: dateOnly(item.date), issuedAt: dateOnly(item.issuedAt), expiresAt: dateOnly(item.expiresAt) } : cfg.empty;
  const form = useForm<any>({ resolver: zodResolver(cfg.schema), defaultValues: defaults });
  const { register, handleSubmit, control, formState, setError } = form;
  const errs = formState.errors as Record<string, { message?: string }>;

  const save = handleSubmit((values) =>
    start(async () => {
      const clean = Object.fromEntries(Object.keys(cfg.empty).map((k) => [k, values[k]]));
      const r = await saveProfileItemAction(kind, item?._id ?? null, clean);
      if (!r.ok) {
        Object.entries(r.fieldErrors ?? {}).forEach(([k, m]) => setError(k, { message: m }));
        return void toast.error(r.error);
      }
      toast.success(r.message);
      onDone(true);
    }),
  );

  return (
    <form onSubmit={save} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {cfg.fields.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : undefined}>
            {f.type === "switch" ? (
              <Controller control={control} name={f.name} render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label={f.label} />} />
            ) : f.type === "image" ? (
              <Field label={f.label}>
                <Controller control={control} name={f.name} render={({ field }) => <ImageField value={field.value} onChange={field.onChange} uploadsEnabled={uploadsEnabled} label={f.label} compact />} />
              </Field>
            ) : (
              <Field label={f.label} htmlFor={`pf-${f.name}`} error={errs[f.name]?.message} hint={f.hint}>
                {f.type === "textarea" ? (
                  <Textarea id={`pf-${f.name}`} rows={3} {...register(f.name)} />
                ) : f.type === "select" ? (
                  <Select id={`pf-${f.name}`} {...register(f.name)}>
                    {f.options!.map((o) => (
                      <option key={o} value={o}>
                        {o[0].toUpperCase() + o.slice(1)}
                      </option>
                    ))}
                  </Select>
                ) : f.type === "icon" ? (
                  <Select id={`pf-${f.name}`} {...register(f.name)}>
                    <option value="">No icon</option>
                    {ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input id={`pf-${f.name}`} type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} placeholder={f.placeholder} aria-invalid={!!errs[f.name]} {...register(f.name)} />
                )}
              </Field>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="ghost" onClick={() => onDone(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {item ? "Save changes" : `Add ${cfg.noun}`}
        </Button>
      </div>
    </form>
  );
}

export function ProfileManager({ kind, items, uploadsEnabled = false }: { kind: Kind; items: any[]; uploadsEnabled?: boolean }) {
  const cfg = CONFIG[kind];
  const router = useRouter();
  const [editing, setEditing] = useState<any | "new" | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Add {cfg.noun}
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-medium">No {cfg.noun}s yet</p>
          <p className="mt-1 text-sm text-fog">Add your own. Nothing is shown on the site until you do.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {items.map((i) => {
            const s = cfg.summary(i);
            const Icon = kind === "skill" && i.icon ? iconFor(i.icon) : null;
            return (
              <li key={i._id} className="flex items-center gap-3 px-4 py-3 hover:bg-hull/40">
                {Icon && <Icon className="h-4 w-4 text-fog" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="truncate text-xs text-fog capitalize">{s.meta}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing(i)} aria-label={`Edit ${s.title}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <ActionButton action={() => deleteProfileItemAction(kind, i._id)} ariaLabel={`Delete ${s.title}`} confirm={{ title: `Delete this ${cfg.noun}?`, body: <>“{s.title}” will be removed from the site.</>, confirmLabel: "Delete", danger: true }}>
                  <Trash2 className="h-4 w-4" />
                </ActionButton>
              </li>
            );
          })}
        </ul>
      )}
      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? `Add ${cfg.noun}` : `Edit ${cfg.noun}`} size="lg">
        {editing !== null && (
          <ItemForm
            kind={kind}
            item={editing === "new" ? null : editing}
            uploadsEnabled={uploadsEnabled}
            onDone={(saved) => {
              setEditing(null);
              if (saved) router.refresh();
            }}
          />
        )}
      </Dialog>
    </>
  );
}
