"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, Loader2, Plus, Save, Send, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { projectSchema } from "@/lib/validation/schemas";
import { saveProjectAction } from "@/lib/actions/projects";
import { CASE_STUDY_SECTIONS, CODE_LANGUAGES, PROJECT_STATES, PROJECT_STATE_LABEL, sectionMeta } from "@/lib/content/constants";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { ImageField, uploadImage } from "./image-field";
import { MarkdownEditor } from "./markdown-editor";
import { SortableList } from "./sortable-list";
import { TagInput } from "./tag-input";
import { Tabs, TabPanel, move, useUnsavedWarning } from "./editor-kit";
import { Panel, StatusPill } from "./ui";

type In = z.input<typeof projectSchema>;
type Out = z.output<typeof projectSchema>;
type TabId = "basics" | "story" | "build" | "media" | "publish";

const TAB_OF: Record<string, TabId> = {
  title: "basics", slug: "basics", summary: "basics", category: "basics", tags: "basics", technologies: "basics", githubUrl: "basics", demoUrl: "basics", relatedProjects: "basics", projectState: "basics",
  sections: "story", implementationSteps: "build", codeSnippets: "build", coverImage: "media", gallery: "media", architectureImages: "media",
  status: "publish", featured: "publish", order: "publish", seo: "publish",
};

export function ProjectEditor({ id, initial, categories, projects, uploadsEnabled }: { id: string | null; initial: In; categories: { _id: string; name: string }[]; projects: { _id: string; title: string; status: string }[]; uploadsEnabled: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("basics");
  const [saving, start] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [relatedFilter, setRelatedFilter] = useState("");

  const form = useForm<In, unknown, Out>({ resolver: zodResolver(projectSchema), defaultValues: initial, mode: "onBlur" });
  const { register, control, handleSubmit, watch, setValue, setError, formState, reset, getValues } = form;
  const errors = formState.errors;
  useUnsavedWarning(formState.isDirty);

  const tech = useFieldArray({ control, name: "technologies" });
  const steps = useFieldArray({ control, name: "implementationSteps" });
  const code = useFieldArray({ control, name: "codeSnippets" });
  const sections = useFieldArray({ control, name: "sections" });

  const status = watch("status");
  const tabErrors = useMemo(() => {
    const out: Partial<Record<TabId, boolean>> = {};
    Object.keys(errors).forEach((k) => (out[TAB_OF[k] ?? "basics"] = true));
    return out;
  }, [errors]);

  const submit = (nextStatus: "draft" | "published") =>
    handleSubmit(
      (values) =>
        start(async () => {
          const res = await saveProjectAction(id, { ...values, status: nextStatus });
          if (!res.ok) {
            Object.entries(res.fieldErrors ?? {}).forEach(([k, m]) => setError(k as keyof In, { message: m }));
            const first = Object.keys(res.fieldErrors ?? {})[0];
            if (first) setTab(TAB_OF[first.split(".")[0]] ?? "basics");
            toast.error(res.error);
            return;
          }
          toast.success(res.message);
          reset({ ...getValues(), status: nextStatus });
          if (!id && res.data) router.replace(`/admin/projects/${res.data.id}/edit`);
          else router.refresh();
        }),
      (errs) => {
        const first = Object.keys(errs)[0];
        setTab(TAB_OF[first] ?? "basics");
        toast.error("Some fields need attention. They're marked in red.");
      },
    )();

  const filteredProjects = projects.filter((p) => p._id !== id && p.title.toLowerCase().includes(relatedFilter.toLowerCase()));

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      {/* Sticky action bar */}
      <div className="glass sticky top-14 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-x-0 border-t-0 px-4 py-3 sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{watch("title") || "Untitled project"}</p>
          <p className="flex items-center gap-2 text-xs text-fog">
            <StatusPill status={status ?? "draft"} />
            {formState.isDirty ? "Unsaved changes" : id ? "All changes saved" : "Not saved yet"}
          </p>
        </div>
        {id && (
          <Link href={`/preview/projects/${id}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-fog hover:bg-hull-2 hover:text-frost">
            <Eye className="h-4 w-4" /> Preview
          </Link>
        )}
        <Button variant="secondary" onClick={() => submit("draft")} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {status === "published" ? "Unpublish & save" : "Save draft"}
        </Button>
        <Button onClick={() => submit("published")} disabled={saving}>
          <Send className="h-4 w-4" />
          {status === "published" ? "Update" : "Publish"}
        </Button>
      </div>

      <Tabs<TabId>
        value={tab}
        onChange={setTab}
        errors={tabErrors}
        tabs={[
          { id: "basics", label: "Basics" },
          { id: "story", label: "Case study" },
          { id: "build", label: "Steps & code" },
          { id: "media", label: "Media" },
          { id: "publish", label: "Publishing & SEO" },
        ]}
      />

      {/* ---------------- Basics ---------------- */}
      <TabPanel id="basics" active={tab === "basics"}>
        <Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title" htmlFor="title" error={errors.title?.message} className="md:col-span-2">
              <Input
                id="title"
                aria-invalid={!!errors.title}
                {...register("title", {
                  onChange: (e) => {
                    if (!slugTouched) setValue("slug", slugify(e.target.value), { shouldDirty: true });
                  },
                })}
              />
            </Field>
            <Field label="Slug" htmlFor="slug" error={errors.slug?.message} hint={<>URL: /projects/{watch("slug") || "…"}</>}>
              <Input id="slug" className="font-mono" aria-invalid={!!errors.slug} {...register("slug", { onChange: () => setSlugTouched(true) })} />
            </Field>
            <Field label="Category" htmlFor="category" error={errors.category?.message} hint={categories.length ? undefined : "Create a category under Domains first."}>
              <Select id="category" {...register("category")}>
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Short description" htmlFor="summary" error={errors.summary?.message} hint="One or two sentences shown on cards and in search results." className="md:col-span-2">
              <Textarea id="summary" rows={2} {...register("summary")} />
            </Field>
            <Field label="Project status" htmlFor="projectState">
              <Select id="projectState" {...register("projectState")}>
                {PROJECT_STATES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATE_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tags" htmlFor="tags" hint="Press Enter or comma to add.">
              <Controller control={control} name="tags" render={({ field }) => <TagInput id="tags" value={field.value ?? []} onChange={field.onChange} placeholder="aws, terraform…" />} />
            </Field>
            <Field label="GitHub repository" htmlFor="githubUrl" error={errors.githubUrl?.message}>
              <Input id="githubUrl" placeholder="https://github.com/you/repo" {...register("githubUrl")} />
            </Field>
            <Field label="Live demo" htmlFor="demoUrl" error={errors.demoUrl?.message}>
              <Input id="demoUrl" placeholder="https://…" {...register("demoUrl")} />
            </Field>
          </div>
        </Panel>

        <Panel title="Technology stack" description="Each tool and the role it played. Shown as badges and in the Technology stack section." actions={<Button variant="secondary" size="sm" onClick={() => tech.append({ name: "", role: "" })}><Plus className="h-3.5 w-3.5" /> Add technology</Button>}>
          {tech.fields.length === 0 ? (
            <p className="text-sm text-fog">No technologies yet.</p>
          ) : (
            <SortableList
              items={tech.fields}
              keyOf={(f) => f.id}
              onMove={(a, b) => tech.move(a, b)}
              render={(_, i) => (
                <div className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
                  <Input aria-label="Technology name" placeholder="Terraform" aria-invalid={!!errors.technologies?.[i]?.name} {...register(`technologies.${i}.name`)} />
                  <Input aria-label="Role in the project" placeholder="What it did in this project" {...register(`technologies.${i}.role`)} />
                  <Button variant="ghost" size="icon" onClick={() => tech.remove(i)} aria-label="Remove technology">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          )}
        </Panel>

        <Panel title="Related projects" description="Shown at the end of the case study. If none are chosen, projects in the same category are used.">
          <Controller
            control={control}
            name="relatedProjects"
            render={({ field }) => (
              <div>
                <Input placeholder="Filter projects" value={relatedFilter} onChange={(e) => setRelatedFilter(e.target.value)} className="mb-3" aria-label="Filter related projects" />
                <ul className="max-h-60 space-y-1 overflow-y-auto">
                  {filteredProjects.length === 0 && <li className="text-sm text-fog">No other projects.</li>}
                  {filteredProjects.map((p) => {
                    const checked = (field.value ?? []).includes(p._id);
                    return (
                      <li key={p._id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-hull-2">
                          <input type="checkbox" checked={checked} onChange={() => field.onChange(checked ? field.value!.filter((x) => x !== p._id) : [...(field.value ?? []), p._id])} className="accent-[var(--signal)]" />
                          <span className="flex-1">{p.title}</span>
                          <StatusPill status={p.status} />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          />
        </Panel>
      </TabPanel>

      {/* ---------------- Case study sections ---------------- */}
      <TabPanel id="story" active={tab === "story"}>
        <p className="text-sm text-fog">Turn sections on or off, rename them, and drag (or use the arrows) to change their order. Enabled sections with no content are hidden on the public page automatically.</p>
        <SortableList
          items={sections.fields}
          keyOf={(f) => f.id}
          onMove={(a, b) => sections.move(a, b)}
          render={(f, i) => {
            const meta = sectionMeta(f.type);
            const enabled = watch(`sections.${i}.enabled`);
            return (
              <details className="group" open={meta?.kind === "markdown" && !!f.content}>
                <summary className="flex cursor-pointer list-none items-center gap-3 py-1">
                  <span onClick={(e) => e.preventDefault()}>
                    <Controller control={control} name={`sections.${i}.enabled`} render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label={`Show ${meta?.title ?? "section"}`} hideLabel />} />
                  </span>
                  <span className={enabled ? "font-medium" : "text-fog line-through"}>{watch(`sections.${i}.title`) || meta?.title}</span>
                  <span className="ml-auto text-xs text-fog">{meta?.kind === "structured" ? "From structured fields" : "Markdown"}</span>
                </summary>
                <div className="mt-3 space-y-3 pb-2">
                  <Input aria-label="Section title" placeholder={meta?.title} {...register(`sections.${i}.title`)} />
                  <p className="text-xs text-fog">{meta?.hint}</p>
                  {(meta?.kind === "markdown" || ["implementation", "code", "screenshots", "diagrams"].includes(f.type)) && (
                    <Controller
                      control={control}
                      name={`sections.${i}.content`}
                      render={({ field }) => <MarkdownEditor value={field.value ?? ""} onChange={field.onChange} rows={meta?.kind === "markdown" ? 8 : 3} uploadsEnabled={uploadsEnabled} placeholder={meta?.kind === "structured" ? "Optional intro text shown above this section" : undefined} />}
                    />
                  )}
                </div>
              </details>
            );
          }}
        />
        {sections.fields.length < CASE_STUDY_SECTIONS.length && (
          <Button
            variant="secondary"
            onClick={() => {
              const have = new Set(getValues("sections")?.map((s) => s.type));
              CASE_STUDY_SECTIONS.filter((s) => !have.has(s.type)).forEach((s) => sections.append({ type: s.type, title: s.title, enabled: true, content: "" }));
            }}
          >
            Restore missing sections
          </Button>
        )}
      </TabPanel>

      {/* ---------------- Steps & code ---------------- */}
      <TabPanel id="build" active={tab === "build"}>
        <Panel title="Implementation steps" description="The ordered steps you followed. Each step supports Markdown." actions={<Button variant="secondary" size="sm" onClick={() => steps.append({ title: "", body: "" })}><Plus className="h-3.5 w-3.5" /> Add step</Button>}>
          {steps.fields.length === 0 ? (
            <p className="text-sm text-fog">No steps yet.</p>
          ) : (
            <SortableList
              items={steps.fields}
              keyOf={(f) => f.id}
              onMove={(a, b) => steps.move(a, b)}
              render={(_, i) => (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line font-mono text-sm text-signal">{i + 1}</span>
                    <Input aria-label={`Step ${i + 1} title`} placeholder="What you did" aria-invalid={!!errors.implementationSteps?.[i]?.title} {...register(`implementationSteps.${i}.title`)} />
                    <Button variant="ghost" size="icon" onClick={() => steps.remove(i)} aria-label={`Remove step ${i + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Controller control={control} name={`implementationSteps.${i}.body`} render={({ field }) => <MarkdownEditor value={field.value ?? ""} onChange={field.onChange} rows={4} uploadsEnabled={uploadsEnabled} />} />
                </div>
              )}
            />
          )}
        </Panel>

        <Panel title="Code snippets" description="Rendered with syntax highlighting and a copy button." actions={<Button variant="secondary" size="sm" onClick={() => code.append({ title: "", language: "bash", code: "", caption: "" })}><Plus className="h-3.5 w-3.5" /> Add snippet</Button>}>
          {code.fields.length === 0 ? (
            <p className="text-sm text-fog">No code snippets yet.</p>
          ) : (
            <SortableList
              items={code.fields}
              keyOf={(f) => f.id}
              onMove={(a, b) => code.move(a, b)}
              render={(_, i) => (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]">
                    <Input aria-label="Snippet title" placeholder="File name or title" {...register(`codeSnippets.${i}.title`)} />
                    <Select aria-label="Language" {...register(`codeSnippets.${i}.language`)}>
                      {CODE_LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => code.remove(i)} aria-label="Remove snippet">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea aria-label="Code" spellCheck={false} rows={8} className="font-mono text-[13px]" aria-invalid={!!errors.codeSnippets?.[i]?.code} {...register(`codeSnippets.${i}.code`)} />
                  {errors.codeSnippets?.[i]?.code && <p className="text-xs text-flare">{errors.codeSnippets[i]?.code?.message}</p>}
                  <Input aria-label="Caption" placeholder="Caption (optional)" {...register(`codeSnippets.${i}.caption`)} />
                </div>
              )}
            />
          )}
        </Panel>
      </TabPanel>

      {/* ---------------- Media ---------------- */}
      <TabPanel id="media" active={tab === "media"}>
        <Panel title="Cover image" description="Used on cards and at the top of the case study. Upload a screenshot or paste a URL. 16:9 or wider works best.">
          <Controller control={control} name="coverImage" render={({ field }) => <ImageField value={field.value ?? null} onChange={field.onChange} uploadsEnabled={uploadsEnabled} label="Cover image" />} />
          {errors.coverImage && <p className="mt-2 text-xs text-flare">{(errors.coverImage as { url?: { message?: string } }).url?.message ?? "Check the cover image."}</p>}
        </Panel>
        {(["gallery", "architectureImages"] as const).map((name) => (
          <Controller
            key={name}
            control={control}
            name={name}
            render={({ field }) => {
              const list = field.value ?? [];
              const isGallery = name === "gallery";
              return (
                <Panel
                  title={isGallery ? "Screenshots" : "Architecture diagrams"}
                  description={isGallery ? "Upload screenshots from your computer (PNG, JPG, WebP). They open in a lightbox on the case study." : "System diagrams. Shown full width."}
                  actions={
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                          multiple
                          className="sr-only"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files ?? []);
                            e.target.value = "";
                            if (!files.length) return;
                            const toastId = toast.loading(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
                            try {
                              const uploaded = [];
                              for (const f of files) uploaded.push(await uploadImage(f));
                              field.onChange([...list, ...uploaded]);
                              toast.success(`Added ${uploaded.length} screenshot${uploaded.length === 1 ? "" : "s"}.`, { id: toastId });
                            } catch (err) {
                              toast.error((err as Error).message, { id: toastId });
                            }
                          }}
                        />
                        <span className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong bg-hull-2 px-3 text-sm font-medium text-frost hover:border-signal/50">
                          <Upload className="h-3.5 w-3.5" /> Upload {isGallery ? "screenshots" : "images"}
                        </span>
                      </label>
                      <Button variant="secondary" size="sm" onClick={() => field.onChange([...list, { url: "", alt: "", caption: "" }])}>
                        <Plus className="h-3.5 w-3.5" /> Add by URL
                      </Button>
                    </div>
                  }
                >
                  {list.length === 0 ? (
                    <p className="text-sm text-fog">{isGallery ? "No screenshots yet. Use Upload screenshots to pick files from your computer." : "No images yet."}</p>
                  ) : (
                    <SortableList
                      items={list}
                      keyOf={(img, i) => `${i}-${img.url}`}
                      onMove={(a, b) => field.onChange(move(list, a, b))}
                      render={(img, i) => (
                        <ImageField
                          compact
                          withCaption
                          value={img.url ? img : { url: "", alt: img.alt, caption: img.caption }}
                          onChange={(v) => field.onChange(v ? list.map((x, j) => (j === i ? v : x)) : list.filter((_, j) => j !== i))}
                          uploadsEnabled={uploadsEnabled}
                          label={`Image ${i + 1}`}
                        />
                      )}
                    />
                  )}
                  {errors[name] && <p className="mt-2 text-xs text-flare">Every image needs a valid URL or upload. Remove empty rows.</p>}
                </Panel>
              );
            }}
          />
        ))}
      </TabPanel>

      {/* ---------------- Publishing ---------------- */}
      <TabPanel id="publish" active={tab === "publish"}>
        <Panel title="Publishing">
          <div className="grid gap-5 md:grid-cols-2">
            <Controller control={control} name="featured" render={({ field }) => <Switch id="featured" checked={!!field.value} onChange={field.onChange} label="Featured" description="Shown in Selected work on the homepage and sorted first." />} />
            <Field label="Sort order" htmlFor="order" hint="Lower numbers appear first. You can also reorder from the projects list.">
              <Input id="order" type="number" min={0} {...register("order")} />
            </Field>
          </div>
          <p className="mt-5 text-sm text-fog">Use the Save draft and Publish buttons at the top. Drafts are never visible on the public site; use Preview to check them.</p>
        </Panel>
        <Panel title="Search and social" description="Leave blank to use the title, short description and cover image.">
          <div className="space-y-5">
            <Field label="SEO title" htmlFor="seo-title" error={errors.seo?.title?.message} hint={`${(watch("seo.title") ?? "").length}/120`}>
              <Input id="seo-title" {...register("seo.title")} />
            </Field>
            <Field label="SEO description" htmlFor="seo-desc" error={errors.seo?.description?.message} hint={`${(watch("seo.description") ?? "").length}/320`}>
              <Textarea id="seo-desc" rows={3} {...register("seo.description")} />
            </Field>
            <Field label="Social image URL" htmlFor="seo-og" error={errors.seo?.ogImage?.message}>
              <Input id="seo-og" placeholder="https://… (1200×630 recommended)" {...register("seo.ogImage")} />
            </Field>
          </div>
        </Panel>
      </TabPanel>
    </form>
  );
}
