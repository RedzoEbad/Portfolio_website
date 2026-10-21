"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { blogCategorySchema, categorySchema } from "@/lib/validation/schemas";
import { deleteBlogCategoryAction, deleteCategoryAction, reorderBlogCategoriesAction, reorderCategoriesAction, saveBlogCategoryAction, saveCategoryAction } from "@/lib/actions/categories";
import { CATEGORY_COLORS } from "@/lib/content/constants";
import { ICONS, iconFor } from "@/lib/content/icons";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { SortableList } from "./sortable-list";
import { ImageField } from "./image-field";
import { move } from "./editor-kit";
import { cn, slugify } from "@/lib/utils";

type Cat = { _id: string; name: string; slug: string; tagline?: string; description: string; icon?: string; color: string; cover?: { url: string; alt?: string; caption?: string } | null; order: number; showOnHome?: boolean; count: number };
type Kind = "project" | "blog";

/* eslint-disable @typescript-eslint/no-explicit-any */
function CategoryForm({ kind, initial, onSaved, onCancel, uploadsEnabled }: { kind: Kind; initial: Cat | null; onSaved: () => void; onCancel: () => void; uploadsEnabled: boolean }) {
  const schema = kind === "project" ? categorySchema : blogCategorySchema;
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [pending, start] = useTransition();
  const form = useForm<any>({
    resolver: zodResolver(schema as any),
    defaultValues: initial
      ? { name: initial.name, slug: initial.slug, tagline: initial.tagline ?? "", description: initial.description ?? "", icon: initial.icon ?? "hexagon", color: initial.color, cover: initial.cover ?? null, order: initial.order, showOnHome: initial.showOnHome ?? true }
      : { name: "", slug: "", tagline: "", description: "", icon: "hexagon", color: kind === "project" ? "#2ee6f5" : "#9d6bff", cover: null, order: 0, showOnHome: true },
  });
  const { register, handleSubmit, control, setValue, watch, formState, setError } = form;
  const e = formState.errors as Record<string, { message?: string }>;
  const color = watch("color");

  const save = handleSubmit((values) =>
    start(async () => {
      const payload = kind === "project" ? values : { name: values.name, slug: values.slug, description: values.description, color: values.color, order: values.order };
      const res = kind === "project" ? await saveCategoryAction(initial?._id ?? null, payload) : await saveBlogCategoryAction(initial?._id ?? null, payload);
      if (!res.ok) {
        Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k, { message: m }));
        toast.error(res.error);
        return;
      }
      toast.success(res.message);
      onSaved();
    }),
  );

  return (
    <form onSubmit={save} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cat-name" error={e.name?.message}>
          <Input id="cat-name" autoFocus aria-invalid={!!e.name} {...register("name", { onChange: (ev) => !slugTouched && setValue("slug", slugify(ev.target.value)) })} />
        </Field>
        <Field label="Slug" htmlFor="cat-slug" error={e.slug?.message} hint={kind === "project" ? `/categories/${watch("slug") || "…"}` : `/blog/category/${watch("slug") || "…"}`}>
          <Input id="cat-slug" className="font-mono" {...register("slug", { onChange: () => setSlugTouched(true) })} />
        </Field>
      </div>
      {kind === "project" && (
        <Field label="Tagline" htmlFor="cat-tagline" error={e.tagline?.message} hint="One line, shown in the domains list on the homepage.">
          <Input id="cat-tagline" {...register("tagline")} />
        </Field>
      )}
      <Field label="Description" htmlFor="cat-desc" error={e.description?.message} hint={kind === "project" ? "Markdown, shown at the top of the category page." : undefined}>
        <Textarea id="cat-desc" rows={3} {...register("description")} />
      </Field>
      <Field label="Colour" htmlFor="cat-color" error={e.color?.message}>
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setValue("color", c, { shouldDirty: true })} className={cn("h-8 w-8 rounded-lg border-2 transition-transform", color === c ? "scale-110 border-frost" : "border-transparent")} style={{ background: c }} aria-label={`Use colour ${c}`} aria-pressed={color === c} />
          ))}
          <Input id="cat-color" className="w-28 font-mono" {...register("color")} />
        </div>
      </Field>
      {kind === "project" && (
        <>
          <Field label="Icon" htmlFor="cat-icon">
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12" role="radiogroup" aria-label="Icon">
                  {Object.entries(ICONS).map(([k, I]) => (
                    <button key={k} type="button" role="radio" aria-checked={field.value === k} onClick={() => field.onChange(k)} title={k} aria-label={k} className={cn("grid aspect-square place-items-center rounded-lg border", field.value === k ? "border-signal bg-signal/10 text-signal" : "border-line text-fog hover:text-frost")}>
                      <I className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            />
          </Field>
          <Field label="Cover image (optional)" htmlFor="cat-cover">
            <Controller control={control} name="cover" render={({ field }) => <ImageField value={field.value} onChange={field.onChange} uploadsEnabled={uploadsEnabled} label="Category cover" compact />} />
          </Field>
          <Controller control={control} name="showOnHome" render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label="Show on the homepage" description="Listed in the Engineering domains section." />} />
        </>
      )}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}

export function CategoryManager({ kind, categories, uploadsEnabled = false }: { kind: Kind; categories: Cat[]; uploadsEnabled?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Cat | "new" | null>(null);
  const [deleting, setDeleting] = useState<Cat | null>(null);
  const [reassign, setReassign] = useState("");
  const [list, setList] = useState(categories);
  const [pending, start] = useTransition();
  const [prev, setPrev] = useState(categories);
  if (prev !== categories) {
    setPrev(categories);
    setList(categories);
  }
  const noun = kind === "project" ? "project" : "article";

  const reorder = (a: number, b: number) => {
    const next = move(list, a, b);
    setList(next);
    start(async () => {
        const ids = next.map((c) => c._id);
        const r = kind === "project" ? await reorderCategoriesAction(ids) : await reorderBlogCategoriesAction(ids);
        if (!r.ok) toast.error(r.error);
        else router.refresh();
      });
  };

  const confirmDelete = () =>
    start(async () => {
      if (!deleting) return;
      const r = kind === "project" ? await deleteCategoryAction(deleting._id, reassign || null) : await deleteBlogCategoryAction(deleting._id, reassign || null);
      if (!r.ok) return void toast.error(r.error);
      toast.success(r.message);
      setDeleting(null);
      setReassign("");
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="font-medium">No categories yet</p>
          <p className="mt-1 text-sm text-fog">Create one and it appears in navigation, filters and the footer immediately.</p>
        </div>
      ) : (
        <SortableList
          items={list}
          keyOf={(c) => c._id}
          onMove={reorder}
          render={(c) => {
            const Icon = iconFor(c.icon);
            return (
              <div className="flex flex-wrap items-center gap-3 py-1">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border" style={{ borderColor: `color-mix(in srgb, ${c.color} 45%, transparent)`, color: c.color }}>
                  {kind === "project" ? <Icon className="h-5 w-5" /> : <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="truncate font-mono text-xs text-fog">/{c.slug}</p>
                </div>
                <span className="text-sm text-fog">
                  {c.count} {noun}
                  {c.count === 1 ? "" : "s"}
                </span>
                {kind === "project" && !c.showOnHome && <span className="text-xs text-fog">hidden on home</span>}
                <div className="flex items-center">
                  {kind === "project" && (
                    <Link href={`/admin/projects/new?category=${c._id}`} className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" title="New project in this category" aria-label={`New project in ${c.name}`}>
                      <Plus className="h-4 w-4" />
                    </Link>
                  )}
                  <Link href={kind === "project" ? `/categories/${c.slug}` : `/blog/category/${c.slug}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" title="View public page" aria-label={`View ${c.name}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          }}
        />
      )}
      {pending && <p className="mt-2 text-xs text-fog">Saving order…</p>}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New category" : "Edit category"} size="lg">
        {editing !== null && (
          <CategoryForm
            kind={kind}
            initial={editing === "new" ? null : editing}
            uploadsEnabled={uploadsEnabled}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={pending || (kind === "project" && !!deleting?.count && !reassign)}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete category
            </Button>
          </>
        }
      >
        {deleting && (
          <div className="space-y-4 text-sm">
            {deleting.count > 0 ? (
              <>
                <p className="rounded-lg border border-[#f5b84a]/40 bg-[#f5b84a]/10 p-3 text-[#f5b84a]">
                  {deleting.count} {noun}
                  {deleting.count === 1 ? " uses" : "s use"} this category. {kind === "project" ? "Choose where to move them so no project is left pointing at a deleted category." : "They'll keep their other categories. Optionally add another one in its place."}
                </p>
                <Field label={kind === "project" ? "Move projects to" : "Also add these articles to"} htmlFor="reassign">
                  <Select id="reassign" value={reassign} onChange={(e) => setReassign(e.target.value)}>
                    <option value="">{kind === "project" ? "Choose…" : "No replacement"}</option>
                    {list
                      .filter((c) => c._id !== deleting._id)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    {kind === "project" && <option value="none">Leave uncategorised</option>}
                  </Select>
                </Field>
              </>
            ) : (
              <p className="text-fog">No {noun}s use this category. It will be removed from navigation and filters.</p>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
