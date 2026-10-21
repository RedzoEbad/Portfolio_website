"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { settingsSchema } from "@/lib/validation/schemas";
import { saveSettingsAction } from "@/lib/actions/profile";
import { STATUS_TONES } from "@/lib/content/constants";
import { ICON_KEYS } from "@/lib/content/icons";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ImageField } from "./image-field";
import { MarkdownEditor } from "./markdown-editor";
import { SortableList } from "./sortable-list";
import { TagInput } from "./tag-input";
import { Tabs, TabPanel, useUnsavedWarning } from "./editor-kit";
import { Panel } from "./ui";

type In = z.input<typeof settingsSchema>;
type Out = z.output<typeof settingsSchema>;
type TabId = "profile" | "home" | "about" | "contact" | "nav" | "seo";
const TAB_OF: Record<string, TabId> = { siteName: "profile", ownerName: "profile", role: "profile", location: "profile", avatar: "profile", footerNote: "profile", hero: "home", impact: "home", home: "home", about: "about", socials: "contact", contact: "contact", nav: "nav", seo: "seo" };

export function SettingsForm({ initial, uploadsEnabled }: { initial: In; uploadsEnabled: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("profile");
  const [saving, start] = useTransition();
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(settingsSchema), defaultValues: initial });
  const { register, control, handleSubmit, formState, reset, getValues } = form;
  const e = formState.errors;
  useUnsavedWarning(formState.isDirty);
  const impact = useFieldArray({ control, name: "impact" });
  const nav = useFieldArray({ control, name: "nav" });

  const tabErrors: Partial<Record<TabId, boolean>> = {};
  Object.keys(e).forEach((k) => (tabErrors[TAB_OF[k] ?? "profile"] = true));

  const save = handleSubmit(
    (values) =>
      start(async () => {
        const r = await saveSettingsAction(values);
        if (!r.ok) return void toast.error(r.error);
        toast.success(r.message);
        reset(getValues());
        router.refresh();
      }),
    (errs) => {
      setTab(TAB_OF[Object.keys(errs)[0]] ?? "profile");
      toast.error("Some fields need attention. They're marked in red.");
    },
  );

  const home = [
    ["showDomains", "Engineering domains"],
    ["showFeatured", "Selected work"],
    ["showImpact", "Problems I work on"],
    ["showTimeline", "Engineering journey"],
    ["showArticles", "Latest writing"],
    ["showContact", "Contact"],
  ] as const;

  return (
    <form onSubmit={save} noValidate>
      <div className="glass sticky top-14 z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-x-0 border-t-0 px-4 py-3 sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
        <p className="text-sm text-fog">{formState.isDirty ? "Unsaved changes" : "All changes saved"}</p>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </Button>
      </div>

      <Tabs<TabId>
        value={tab}
        onChange={setTab}
        errors={tabErrors}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "home", label: "Homepage" },
          { id: "about", label: "About" },
          { id: "contact", label: "Contact & social" },
          { id: "nav", label: "Navigation" },
          { id: "seo", label: "SEO" },
        ]}
      />

      <TabPanel id="profile" active={tab === "profile"}>
        <Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Site name" htmlFor="siteName" error={e.siteName?.message} hint="Shown in the navigation and browser tab.">
              <Input id="siteName" {...register("siteName")} />
            </Field>
            <Field label="Your name" htmlFor="ownerName" error={e.ownerName?.message}>
              <Input id="ownerName" {...register("ownerName")} />
            </Field>
            <Field label="Role" htmlFor="role" hint="e.g. Cloud & Platform Engineer">
              <Input id="role" {...register("role")} />
            </Field>
            <Field label="Location (optional)" htmlFor="location">
              <Input id="location" {...register("location")} />
            </Field>
            <Field label="Footer note (optional)" htmlFor="footerNote" className="md:col-span-2">
              <Input id="footerNote" {...register("footerNote")} />
            </Field>
          </div>
        </Panel>
        <Panel title="Portrait" description="Shown on the About page.">
          <Controller control={control} name="avatar" render={({ field }) => <ImageField value={field.value ?? null} onChange={field.onChange} uploadsEnabled={uploadsEnabled} label="Portrait" />} />
        </Panel>
      </TabPanel>

      <TabPanel id="home" active={tab === "home"}>
        <Panel title="Hero">
          <div className="space-y-5">
            <Field label="Headline" htmlFor="h-headline" error={e.hero?.headline?.message} hint="Each sentence becomes its own line.">
              <Input id="h-headline" {...register("hero.headline")} />
            </Field>
            <Field label="Supporting text" htmlFor="h-sub" error={e.hero?.subheadline?.message}>
              <Textarea id="h-sub" rows={3} {...register("hero.subheadline")} />
            </Field>
            <div className="grid gap-5 md:grid-cols-[1fr_12rem]">
              <Field label="Status line" htmlFor="h-status" hint="A short, honest note, e.g. “Open to platform engineering roles”.">
                <Input id="h-status" {...register("hero.statusText")} />
              </Field>
              <Field label="Status colour" htmlFor="h-tone">
                <Select id="h-tone" {...register("hero.statusTone")}>
                  {STATUS_TONES.map((t) => (
                    <option key={t} value={t}>
                      {t === "hidden" ? "Hide status" : t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </Panel>
        <Panel title="Sections" description="Turn homepage sections on or off and set how many items they show.">
          <div className="grid gap-4 sm:grid-cols-2">
            {home.map(([k, label]) => (
              <Controller key={k} control={control} name={`home.${k}`} render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label={label} />} />
            ))}
            <Field label="Featured projects shown" htmlFor="featuredLimit">
              <Input id="featuredLimit" type="number" min={1} max={12} {...register("home.featuredLimit")} />
            </Field>
            <Field label="Articles shown" htmlFor="articlesLimit">
              <Input id="articlesLimit" type="number" min={1} max={12} {...register("home.articlesLimit")} />
            </Field>
          </div>
        </Panel>
        <Panel
          title="Problems I work on"
          description="Metric fields are optional. Only fill them with numbers you can stand behind; empty metrics are simply not shown."
          actions={
            <Button variant="secondary" size="sm" onClick={() => impact.append({ title: "", description: "", icon: "hexagon", metricValue: "", metricLabel: "" })}>
              <Plus className="h-3.5 w-3.5" /> Add item
            </Button>
          }
        >
          <SortableList
            items={impact.fields}
            keyOf={(f) => f.id}
            onMove={(a, b) => impact.move(a, b)}
            render={(_, i) => (
              <div className="grid gap-2 md:grid-cols-[1fr_10rem_auto]">
                <Input aria-label="Title" placeholder="Title" aria-invalid={!!e.impact?.[i]?.title} {...register(`impact.${i}.title`)} />
                <Select aria-label="Icon" {...register(`impact.${i}.icon`)}>
                  {ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </Select>
                <Button variant="ghost" size="icon" onClick={() => impact.remove(i)} aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Textarea aria-label="Description" rows={2} placeholder="Description" className="md:col-span-3" {...register(`impact.${i}.description`)} />
                <Input aria-label="Metric value" placeholder="Metric value (optional), e.g. 40%" {...register(`impact.${i}.metricValue`)} />
                <Input aria-label="Metric label" placeholder="Metric label, e.g. faster deploys" className="md:col-span-2" {...register(`impact.${i}.metricLabel`)} />
              </div>
            )}
          />
        </Panel>
      </TabPanel>

      <TabPanel id="about" active={tab === "about"}>
        <Panel>
          <div className="space-y-5">
            <Field label="Introduction" htmlFor="about-intro" hint="One or two sentences under the About page title.">
              <Textarea id="about-intro" rows={2} {...register("about.intro")} />
            </Field>
            <Field label="Bio" htmlFor="about-body">
              <Controller control={control} name="about.body" render={({ field }) => <MarkdownEditor id="about-body" value={field.value ?? ""} onChange={field.onChange} rows={14} uploadsEnabled={uploadsEnabled} />} />
            </Field>
          </div>
        </Panel>
      </TabPanel>

      <TabPanel id="contact" active={tab === "contact"}>
        <Panel title="Social links" description="Only links you fill in are shown.">
          <div className="grid gap-5 md:grid-cols-2">
            {(["github", "linkedin", "x", "website"] as const).map((k) => (
              <Field key={k} label={k === "x" ? "X / Twitter" : k === "github" ? "GitHub" : k === "linkedin" ? "LinkedIn" : "Website"} htmlFor={`s-${k}`} error={e.socials?.[k]?.message}>
                <Input id={`s-${k}`} placeholder="https://…" {...register(`socials.${k}`)} />
              </Field>
            ))}
          </div>
        </Panel>
        <Panel title="Contact">
          <div className="space-y-5">
            <Field label="Email" htmlFor="c-email" error={e.contact?.email?.message} hint="Private unless you turn on the switch below.">
              <Input id="c-email" type="email" {...register("contact.email")} />
            </Field>
            <Controller control={control} name="contact.showEmail" render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label="Show email publicly" description="Adds a mailto link to the contact section and footer." />} />
            <Controller control={control} name="contact.formEnabled" render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label="Enable the contact form" description="Messages are saved to Messages in this admin portal." />} />
            <Field label="Contact note" htmlFor="c-note" hint="Shown beside the form.">
              <Textarea id="c-note" rows={2} {...register("contact.note")} />
            </Field>
          </div>
        </Panel>
      </TabPanel>

      <TabPanel id="nav" active={tab === "nav"}>
        <Panel
          title="Main navigation"
          description="Links in the header and footer. Use site paths (/projects, /#domains) or full URLs."
          actions={
            <Button variant="secondary" size="sm" onClick={() => nav.append({ label: "", href: "/", enabled: true })}>
              <Plus className="h-3.5 w-3.5" /> Add link
            </Button>
          }
        >
          <SortableList
            items={nav.fields}
            keyOf={(f) => f.id}
            onMove={(a, b) => nav.move(a, b)}
            render={(_, i) => (
              <div className="grid items-center gap-2 sm:grid-cols-[10rem_1fr_auto_auto]">
                <Input aria-label="Label" placeholder="Label" aria-invalid={!!e.nav?.[i]?.label} {...register(`nav.${i}.label`)} />
                <Input aria-label="Link" placeholder="/projects" className="font-mono" aria-invalid={!!e.nav?.[i]?.href} {...register(`nav.${i}.href`)} />
                <Controller control={control} name={`nav.${i}.enabled`} render={({ field }) => <Switch checked={!!field.value} onChange={field.onChange} label="Shown" />} />
                <Button variant="ghost" size="icon" onClick={() => nav.remove(i)} aria-label="Remove link">
                  <Trash2 className="h-4 w-4" />
                </Button>
                {(e.nav?.[i]?.href || e.nav?.[i]?.label) && <p className="text-xs text-flare sm:col-span-4">{e.nav?.[i]?.href?.message ?? e.nav?.[i]?.label?.message}</p>}
              </div>
            )}
          />
        </Panel>
      </TabPanel>

      <TabPanel id="seo" active={tab === "seo"}>
        <Panel title="Default search and social metadata" description="Pages without their own SEO fields fall back to these.">
          <div className="space-y-5">
            <Field label="Site title" htmlFor="seo-t" hint="Defaults to the site name.">
              <Input id="seo-t" {...register("seo.title")} />
            </Field>
            <Field label="Description" htmlFor="seo-d" hint="Defaults to the hero supporting text.">
              <Textarea id="seo-d" rows={3} {...register("seo.description")} />
            </Field>
            <Field label="Default social image URL" htmlFor="seo-og" error={e.seo?.ogImage?.message} hint="1200×630 recommended.">
              <Input id="seo-og" {...register("seo.ogImage")} />
            </Field>
            <Field label="Keywords" htmlFor="seo-k">
              <Controller control={control} name="seo.keywords" render={({ field }) => <TagInput id="seo-k" value={field.value ?? []} onChange={field.onChange} />} />
            </Field>
          </div>
        </Panel>
      </TabPanel>
    </form>
  );
}
