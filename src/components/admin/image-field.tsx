"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { ImageInput } from "@/lib/validation/schemas";
import { recordMediaAction, signUploadAction, uploadLocalImageAction } from "@/lib/actions/media";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 10 * 1024 * 1024;

function assertImageFile(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file (PNG, JPG, WebP, GIF or AVIF).");
  if (file.size > MAX_BYTES) throw new Error("Images must be 10 MB or smaller.");
}

/** Cloudinary when configured; otherwise saves under /uploads on this server. */
export async function uploadImage(file: File): Promise<ImageInput> {
  assertImageFile(file);
  const ticket = await signUploadAction();
  if (ticket.ok && ticket.data) {
    const t = ticket.data;
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", t.apiKey);
    body.append("timestamp", String(t.timestamp));
    body.append("signature", t.signature);
    body.append("folder", t.folder);
    body.append("allowed_formats", t.allowedFormats);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${t.cloudName}/image/upload`, { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message ? `Cloudinary rejected the upload: ${json.error.message}` : "The upload failed. Check your Cloudinary settings.");
    await recordMediaAction({ url: json.secure_url, publicId: json.public_id, width: json.width, height: json.height, bytes: json.bytes, format: json.format });
    return { url: json.secure_url, alt: "", caption: "", width: json.width, height: json.height };
  }

  // Cloudinary not configured — try local disk (dev only; blocked on Vercel).
  const fd = new FormData();
  fd.append("file", file);
  const local = await uploadLocalImageAction(fd);
  if (!local.ok) {
    throw new Error(
      local.error ||
        "Image uploads need Cloudinary on Vercel. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, then redeploy.",
    );
  }
  if (!local.data) throw new Error("The upload failed.");
  return local.data;
}

/** @deprecated Use uploadImage — kept for any older imports. */
export const uploadToCloudinary = uploadImage;

type ImageValue = { url: string; alt?: string; caption?: string; width?: number; height?: number };

export function ImageField({
  value,
  onChange,
  uploadsEnabled = true,
  label = "Image",
  withCaption = false,
  compact = false,
}: {
  value: ImageValue | null;
  onChange: (v: ImageInput | null) => void;
  /** Kept for call-site compatibility; uploads always work (Cloudinary or local). */
  uploadsEnabled?: boolean;
  label?: string;
  withCaption?: boolean;
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const img = value ?? null;
  void uploadsEnabled;

  const onFile = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      const up = await uploadImage(f);
      onChange({ ...up, alt: img?.alt || "", caption: img?.caption || "" });
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className={compact ? "flex gap-3" : "grid gap-4 sm:grid-cols-[9rem_1fr]"}>
      <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-hull-2 ${compact ? "h-20 w-28" : "aspect-[4/3] w-full"}`}>
        {img?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <ImageIcon className="h-6 w-6 text-fog" aria-hidden="true" />
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-abyss/70">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            aria-label={`${label} URL`}
            placeholder="https://… or upload a file"
            value={img?.url ?? ""}
            onChange={(e) => onChange(e.target.value ? { url: e.target.value, alt: img?.alt ?? "", caption: img?.caption ?? "" } : null)}
          />
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button variant="secondary" size="md" disabled={busy} onClick={() => fileRef.current?.click()} aria-label={`Upload ${label}`} title="Upload image from your computer">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          {img && (
            <Button variant="ghost" size="icon" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {img && (
          <>
            <Input aria-label="Alt text" placeholder="Alt text: describe what the image shows" value={img.alt ?? ""} onChange={(e) => onChange({ ...img, alt: e.target.value, caption: img.caption ?? "" })} />
            {withCaption && <Input aria-label="Caption" placeholder="Caption (optional)" value={img.caption ?? ""} onChange={(e) => onChange({ ...img, alt: img.alt ?? "", caption: e.target.value })} />}
          </>
        )}
      </div>
    </div>
  );
}
