"use client";

import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageField, uploadImage } from "./image-field";
import { SortableList } from "./sortable-list";
import { Panel } from "./ui";
import { move } from "./editor-kit";

type GalleryImage = { url: string; alt?: string; caption?: string; width?: number; height?: number };

/** Multi-upload + reorder list for project screenshots / diagrams. */
export function ProjectImageList({
  title,
  description,
  emptyHint,
  list,
  onChange,
  uploadsEnabled,
  error,
  onUploaded,
}: {
  title: string;
  description: string;
  emptyHint: string;
  list: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
  uploadsEnabled?: boolean;
  error?: boolean;
  onUploaded?: (next: GalleryImage[]) => void;
}) {
  return (
    <Panel
      title={title}
      description={description}
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
                  const uploaded: GalleryImage[] = [];
                  for (const f of files) uploaded.push(await uploadImage(f));
                  const next = [...list, ...uploaded];
                  onChange(next);
                  onUploaded?.(next);
                  toast.success(`Added ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}.`, { id: toastId });
                } catch (err) {
                  toast.error((err as Error).message, { id: toastId });
                }
              }}
            />
            <span className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line-strong bg-hull-2 px-3 text-sm font-medium text-frost hover:border-signal/50">
              <Upload className="h-3.5 w-3.5" /> Upload screenshots
            </span>
          </label>
          <Button variant="secondary" size="sm" onClick={() => onChange([...list, { url: "https://", alt: "", caption: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Add by URL
          </Button>
        </div>
      }
    >
      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-abyss/40 px-4 py-10 text-center">
          <p className="text-sm text-fog">{emptyHint}</p>
          <label className="mt-4 inline-flex cursor-pointer">
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
                  const uploaded: GalleryImage[] = [];
                  for (const f of files) uploaded.push(await uploadImage(f));
                  const next = [...list, ...uploaded];
                  onChange(next);
                  onUploaded?.(next);
                  toast.success(`Added ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}.`, { id: toastId });
                } catch (err) {
                  toast.error((err as Error).message, { id: toastId });
                }
              }}
            />
            <span className="inline-flex h-10 items-center gap-2 rounded-lg bg-signal px-4 text-sm font-medium text-signal-ink">
              <Upload className="h-4 w-4" /> Choose screenshots
            </span>
          </label>
        </div>
      ) : (
        <SortableList
          items={list}
          keyOf={(img, i) => `${i}-${img.url}`}
          onMove={(a, b) => onChange(move(list, a, b))}
          render={(img, i) => (
            <ImageField
              compact
              withCaption
              value={img.url ? img : { url: "", alt: img.alt, caption: img.caption }}
              onChange={(v) => onChange(v ? list.map((x, j) => (j === i ? v : x)) : list.filter((_, j) => j !== i))}
              uploadsEnabled={uploadsEnabled}
              label={`Screenshot ${i + 1}`}
            />
          )}
        />
      )}
      {error && <p className="mt-2 text-xs text-flare">Every image needs a valid URL or upload. Remove empty rows.</p>}
    </Panel>
  );
}
