"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyPlus, Eye, EyeOff, Pencil, Trash2, Upload } from "lucide-react";
import { deletePostAction, duplicatePostAction, setPostStatusAction } from "@/lib/actions/blog";
import { ActionButton } from "./confirm";

export function PostRowActions({ id, title, status }: { id: string; title: string; status: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link href={`/admin/blog/${id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" aria-label={`Edit ${title}`} title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <Link href={`/preview/blog/${id}`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" aria-label={`Preview ${title}`} title="Preview">
        <Eye className="h-4 w-4" />
      </Link>
      <ActionButton action={() => setPostStatusAction(id, status === "draft" ? "published" : "draft")} ariaLabel={status === "draft" ? `Publish ${title}` : `Unpublish ${title}`} title={status === "draft" ? "Publish" : "Unpublish"}>
        {status === "draft" ? <Upload className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </ActionButton>
      <ActionButton action={() => duplicatePostAction(id)} ariaLabel={`Duplicate ${title}`} title="Duplicate" onDone={(r) => r.ok && (r.data as { id?: string })?.id && router.push(`/admin/blog/${(r.data as { id: string }).id}/edit`)}>
        <CopyPlus className="h-4 w-4" />
      </ActionButton>
      <ActionButton action={() => deletePostAction(id)} ariaLabel={`Delete ${title}`} title="Delete" confirm={{ title: "Delete this article?", body: <>“{title}” will be permanently deleted. This can&apos;t be undone.</>, confirmLabel: "Delete article", danger: true }}>
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}
