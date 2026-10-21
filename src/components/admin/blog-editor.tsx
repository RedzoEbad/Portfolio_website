"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CalendarClock, Eye, Loader2, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { blogPostSchema } from "@/lib/validation/schemas";
import { savePostAction } from "@/lib/actions/blog";
import { Field, Input, Switch, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { readingTime, slugify } from "@/lib/utils";
import { ImageField } from "./image-field";
import { MarkdownEditor } from "./markdown-editor";
import { TagInput } from "./tag-input";
import { useUnsavedWarning } from "./editor-kit";
import { Panel, StatusPill } from "./ui";

type In = z.input<typeof blogPostSchema>;
type Out = z.output<typeof blogPostSchema>;

/** ISO → value for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function BlogEditor({ id, initial, categories, projects, uploadsEnabled }: { id: string | null; initial: In; categories: { _id: string; name: string; color: string }[]; projects: { _id: string; title: string }[]; uploadsEnabled: boolean }) {
  const router = useRouter();
  const [saving, start] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [localDate, setLocalDate] = useState(toLocalInput(initial.publishedAt));
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(blogPostSchema), defaultValues: initial });
  const { register, control, handleSubmit, watch, setValue, setError, formState, reset, getValues } = form;
  const e = formState.errors;
  useUnsavedWarning(formState.isDirty);
  const status = watch("status");
  const content = watch("content") ?? "";
  const scheduled = status === "published" && localDate && new Date(localDate) > new Date();

  const submit = (nextStatus: "draft" | "published") =>
    handleSubmit(
      (values) =>
        start(async () => {
          const publishedAt = localDate ? new Date(localDate).toISOString() : "";
          const res = await savePostAction(id, { ...values, status: nextStatus, publishedAt });
          if (!res.ok) {
            Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k as keyof In, { message: m }));
            toast.error(res.error);
            return;
          }
          toast.success(res.message);
          reset({ ...getValues(), status: nextStatus, publishedAt });
          if (!id && res.data) router.replace(`/admin/blog/${res.data.id}/edit`);
          else router.refresh();
        }),
      () => toast.error("Some fields need attention. They're marked in red."),
    )();

  return (
    <form onSubmit={(ev) => ev.preventDefault()} noValidate>
      <div className="glass sticky top-14 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-x-0 border-t-0 px-4 py-3 sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{watch("title") || "Untitled article"}</p>
          <p className="flex items-center gap-2 text-xs text-fog">
            <StatusPill status={scheduled && status === "published" ? "scheduled" : (status ?? "draft")} />
            {formState.isDirty ? "Unsaved changes" : id ? "All changes saved" : "Not saved yet"}
            <span>· {readingTime(content)} min read</span>
          </p>
        </div>
        {id && (
          <Link href={`/preview/blog/${id}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-fog hover:bg-hull-2 hover:text-frost">
            <Eye className="h-4 w-4" /> Preview
          </Link>
        )}
        <Button variant="secondary" onClick={() => submit("draft")} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {status === "published" ? "Unpublish & save" : "Save draft"}
        </Button>
        <Button onClick={() => submit("published")} disabled={saving}>
          {localDate && new Date(localDate) > new Date() ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          {localDate && new Date(localDate) > new Date() ? "Schedule" : status === "published" ? "Update" : "Publish"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <Field label="Title" htmlFor="title" error={e.title?.message}>
            <Input id="title" className="h-12 text-lg" aria-invalid={!!e.title} {...register("title", { onChange: (ev) => !slugTouched && setValue("slug", slugify(ev.target.value), { shouldDirty: true }) })} />
          </Field>
          <Field label="Slug" htmlFor="slug" error={e.slug?.message} hint={<>URL: /blog/{watch("slug") || "…"}</>}>
            <Input id="slug" className="font-mono" {...register("slug", { onChange: () => setSlugTouched(true) })} />
          </Field>
          <Field label="Excerpt" htmlFor="excerpt" error={e.excerpt?.message} hint="Shown on cards and as the default search description.">
            <Textarea id="excerpt" rows={2} {...register("excerpt")} />
          </Field>
          <Field label="Content" htmlFor="content" error={e.content?.message}>
            <Controller control={control} name="content" render={({ field }) => <MarkdownEditor id="content" value={field.value ?? ""} onChange={field.onChange} rows={24} uploadsEnabled={uploadsEnabled} placeholder="## Start with the problem…" />} />
          </Field>
        </div>

        <div className="space-y-5">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Field label="Publish date" htmlFor="publishedAt" hint="Leave empty to use the moment you publish. A future date schedules the article.">
                <Input id="publishedAt" type="datetime-local" value={localDate} onChange={(ev) => {
                  setLocalDate(ev.target.value);
                  setValue("publishedAt", ev.target.value ? new Date(ev.target.value).toISOString() : "", { shouldDirty: true });
                }} />
              </Field>
              <Controller control={control} name="featured" render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label="Featured" description="Pinned to the top of the blog." />} />
            </div>
          </Panel>
          <Panel title="Categories" description={categories.length ? undefined : "No blog categories yet."} actions={<Link href="/admin/blog/categories" className="text-xs text-signal hover:underline">Manage</Link>}>
            <Controller
              control={control}
              name="categories"
              render={({ field }) => (
                <ul className="space-y-1">
                  {categories.map((c) => {
                    const on = (field.value ?? []).includes(c._id);
                    return (
                      <li key={c._id}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-hull-2">
                          <input type="checkbox" checked={on} onChange={() => field.onChange(on ? field.value!.filter((x) => x !== c._id) : [...(field.value ?? []), c._id])} className="accent-[var(--signal)]" />
                          <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                          {c.name}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            />
          </Panel>
          <Panel title="Tags">
            <Controller control={control} name="tags" render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="kubernetes, terraform…" />} />
          </Panel>
          <Panel title="Cover image">
            <Controller control={control} name="coverImage" render={({ field }) => <ImageField value={field.value ?? null} onChange={field.onChange} uploadsEnabled={uploadsEnabled} label="Cover image" withCaption />} />
          </Panel>
          <Panel title="Related projects">
            <Controller
              control={control}
              name="relatedProjects"
              render={({ field }) => (
                <ul className="max-h-52 space-y-1 overflow-y-auto">
                  {projects.length === 0 && <li className="text-sm text-fog">No projects yet.</li>}
                  {projects.map((p) => {
                    const on = (field.value ?? []).includes(p._id);
                    return (
                      <li key={p._id}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-hull-2">
                          <input type="checkbox" checked={on} onChange={() => field.onChange(on ? field.value!.filter((x) => x !== p._id) : [...(field.value ?? []), p._id])} className="accent-[var(--signal)]" />
                          {p.title}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            />
          </Panel>
          <Panel title="Search and social">
            <div className="space-y-4">
              <Field label="SEO title" htmlFor="seo-title" error={e.seo?.title?.message}>
                <Input id="seo-title" {...register("seo.title")} />
              </Field>
              <Field label="SEO description" htmlFor="seo-desc" error={e.seo?.description?.message}>
                <Textarea id="seo-desc" rows={3} {...register("seo.description")} />
              </Field>
              <Field label="Social image URL" htmlFor="seo-og" error={e.seo?.ogImage?.message}>
                <Input id="seo-og" {...register("seo.ogImage")} />
              </Field>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
