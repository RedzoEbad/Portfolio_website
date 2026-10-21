"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyPlus, Eye, EyeOff, Pencil, Star, Trash2, Upload } from "lucide-react";
import { deleteProjectAction, duplicateProjectAction, setProjectStatusAction, toggleProjectFeaturedAction } from "@/lib/actions/projects";
import { ActionButton } from "./confirm";

export function ProjectRowActions({ id, title, status, featured }: { id: string; title: string; status: string; featured: boolean }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link href={`/admin/projects/${id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" aria-label={`Edit ${title}`} title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <Link href={`/preview/projects/${id}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" aria-label={`Preview ${title}`} title="Preview">
        <Eye className="h-4 w-4" />
      </Link>
      <ActionButton action={() => toggleProjectFeaturedAction(id, !featured)} ariaLabel={featured ? `Unfeature ${title}` : `Feature ${title}`} title={featured ? "Remove from featured" : "Feature"}>
        <Star className={featured ? "h-4 w-4 fill-signal text-signal" : "h-4 w-4"} />
      </ActionButton>
      <ActionButton action={() => setProjectStatusAction(id, status === "published" ? "draft" : "published")} ariaLabel={status === "published" ? `Unpublish ${title}` : `Publish ${title}`} title={status === "published" ? "Unpublish" : "Publish"}>
        {status === "published" ? <EyeOff className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </ActionButton>
      <ActionButton action={() => duplicateProjectAction(id)} ariaLabel={`Duplicate ${title}`} title="Duplicate" onDone={(r) => r.ok && (r.data as { id?: string })?.id && router.push(`/admin/projects/${(r.data as { id: string }).id}/edit`)}>
        <CopyPlus className="h-4 w-4" />
      </ActionButton>
      <ActionButton
        action={() => deleteProjectAction(id)}
        ariaLabel={`Delete ${title}`}
        title="Delete"
        confirm={{ title: "Delete this project?", body: <>“{title}” will be permanently deleted, including its case study. References from other projects and articles are removed. This can&apos;t be undone.</>, confirmLabel: "Delete project", danger: true }}
      >
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}
