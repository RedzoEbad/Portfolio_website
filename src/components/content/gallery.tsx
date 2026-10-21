"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/content/types";
import { SmartImage } from "@/components/media/smart-image";
import { cn } from "@/lib/utils";

/** Responsive gallery with a keyboard-navigable lightbox (←/→, Esc; focus returns to the thumbnail). */
export function Gallery({ images, layout = "grid", label }: { images: Img[]; layout?: "grid" | "stack"; label: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastIndex = useRef(0);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (index !== null) {
      lastIndex.current = index;
      if (!dlg.open) dlg.showModal();
    } else if (dlg.open) {
      dlg.close();
      triggers.current[lastIndex.current]?.focus();
    }
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className={cn("grid gap-4", layout === "grid" ? "sm:grid-cols-2" : "grid-cols-1")}>
        {images.map((img, i) => (
          <li key={img.url + i} className={cn(layout === "grid" && images.length % 2 === 1 && i === 0 && "sm:col-span-2")}>
            <figure>
              <button
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-hull-2"
                aria-label={`Open image ${i + 1} of ${images.length}${img.alt ? `: ${img.alt}` : ""}`}
              >
                <SmartImage src={img.url} alt={img.alt || ""} fill sizes={layout === "grid" ? "(min-width: 640px) 50vw, 100vw" : "100vw"} className="object-contain p-1" />
                <span className="glass absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </button>
              {img.caption && <figcaption className="mt-2 text-sm text-fog">{img.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef} onClose={close} aria-label={`${label} image viewer`} className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-abyss/92 backdrop:backdrop-blur-md">
        {current && (
          <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="flex items-center justify-between px-4 py-3 text-sm text-fog sm:px-6">
              <span aria-live="polite">
                {index! + 1} / {images.length}
              </span>
              <button type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-hull-2 text-frost hover:bg-hull" aria-label="Close image viewer" autoFocus>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4 sm:px-16" onClick={(e) => e.target === e.currentTarget && close()}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure key={index} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.22 }} className="flex max-h-full flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={current.url} alt={current.alt || ""} className="max-h-[78vh] w-auto max-w-full rounded-lg border border-line object-contain" />
                  {current.caption && <figcaption className="mt-3 max-w-2xl text-center text-sm text-fog">{current.caption}</figcaption>}
                </motion.figure>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-hull-2 text-frost hover:bg-hull sm:left-4" aria-label="Previous image">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => step(1)} className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-hull-2 text-frost hover:bg-hull sm:right-4" aria-label="Next image">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
                {images.map((img, i) => (
                  <button key={img.url + i} type="button" onClick={() => setIndex(i)} className={cn("relative h-12 w-20 shrink-0 overflow-hidden rounded-md border", i === index ? "border-signal" : "border-line opacity-60 hover:opacity-100")} aria-label={`Show image ${i + 1}`} aria-current={i === index}>
                    <SmartImage src={img.url} alt="" fill sizes="80px" className="object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
