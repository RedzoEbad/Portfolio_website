"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/content/types";
import { SmartImage } from "@/components/media/smart-image";
import { useSafeReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const AUTO_MS = 4000;

/** Autoplay slider (pauses on hover) + fullscreen lightbox on click. */
export function Gallery({ images, layout = "slider", label }: { images: Img[]; layout?: "slider" | "grid" | "stack" | "mosaic"; label: string }) {
  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduce = useSafeReducedMotion();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastIndex = useRef(0);
  const n = images.length;

  const go = useCallback((i: number) => setSlide(((i % n) + n) % n), [n]);
  const step = useCallback((d: number) => setSlide((s) => (s + d + n) % n), [n]);
  const open = useCallback((i: number) => setLightbox(i), []);
  const close = useCallback(() => setLightbox(null), []);
  const lightboxStep = useCallback((d: number) => setLightbox((i) => (i === null ? i : (i + d + n) % n)), [n]);

  // Autoplay — pauses while hovered, manually paused, lightbox open, or reduced motion
  useEffect(() => {
    if (n < 2 || reduce || paused || hovering || lightbox !== null) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % n), AUTO_MS);
    return () => window.clearInterval(id);
  }, [n, reduce, paused, hovering, lightbox]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (lightbox !== null) {
      lastIndex.current = lightbox;
      if (!dlg.open) dlg.showModal();
    } else if (dlg.open) {
      dlg.close();
      triggers.current[lastIndex.current]?.focus();
    }
  }, [lightbox]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") lightboxStep(1);
      if (e.key === "ArrowLeft") lightboxStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, lightboxStep]);

  if (!n) return null;
  const current = lightbox !== null ? images[lightbox] : null;
  const active = images[slide] ?? images[0];

  if (layout === "grid" || layout === "stack" || layout === "mosaic") {
    const mosaic = layout === "mosaic";
    return (
      <>
        <ul
          className={cn(
            "grid gap-3 sm:gap-4",
            layout === "stack" && "grid-cols-1",
            layout === "grid" && "sm:grid-cols-2",
            mosaic && "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {images.map((img, i) => (
            <li
              key={img.url + i}
              className={cn(
                layout === "grid" && n % 2 === 1 && i === 0 && "sm:col-span-2",
                mosaic && i === 0 && n > 2 && "sm:col-span-2 sm:row-span-2",
              )}
            >
              <figure className="h-full">
                <button
                  ref={(el) => {
                    triggers.current[i] = el;
                  }}
                  type="button"
                  onClick={() => open(i)}
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-2xl border border-line bg-hull-2 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-signal/40",
                    mosaic && i === 0 && n > 2 ? "aspect-[4/3] sm:h-full sm:min-h-[22rem] sm:aspect-auto" : "aspect-[16/10]",
                  )}
                  aria-label={`Open image ${i + 1} of ${n}${img.alt ? `: ${img.alt}` : ""}`}
                >
                  <SmartImage
                    src={img.url}
                    alt={img.alt || ""}
                    fill
                    sizes={mosaic ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : layout === "grid" ? "(min-width: 640px) 50vw, 100vw" : "100vw"}
                    className={cn(mosaic ? "object-cover transition-transform duration-500 group-hover:scale-[1.03]" : "object-contain p-1")}
                  />
                  <span className="glass absolute right-3 bottom-3 grid h-8 w-8 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </button>
                {img.caption && <figcaption className="mt-2 text-sm text-fog">{img.caption}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
        <Lightbox dialogRef={dialogRef} label={label} current={current} index={lightbox} total={n} images={images} onClose={close} onStep={lightboxStep} onSelect={open} />
      </>
    );
  }

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl border border-line bg-hull-2"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocusCapture={() => setHovering(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false);
        }}
      >
        <div className="relative aspect-[16/10] w-full sm:aspect-[21/10]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={slide}
              type="button"
              ref={(el) => {
                triggers.current[slide] = el;
              }}
              initial={reduce ? false : { opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -28 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => open(slide)}
              className="absolute inset-0 grid place-items-center"
              aria-label={`Open screenshot ${slide + 1} of ${n} full screen${active.alt ? `: ${active.alt}` : ""}`}
            >
              <SmartImage src={active.url} alt={active.alt || ""} fill sizes="(min-width: 1280px) 1100px, 100vw" className="object-contain p-3 sm:p-5" priority={slide === 0} />
              <span className="glass absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full text-frost sm:right-4 sm:bottom-4" aria-hidden="true">
                <ZoomIn className="h-4 w-4" />
              </span>
            </motion.button>
          </AnimatePresence>
        </div>

        {active.caption && <p className="border-t border-line px-4 py-2.5 text-center text-sm text-fog">{active.caption}</p>}

        {n > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} className="absolute top-1/2 left-2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-hull/90 text-frost shadow-sm hover:border-signal/50 sm:left-3" aria-label="Previous screenshot">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => step(1)} className="absolute top-1/2 right-2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-hull/90 text-frost shadow-sm hover:border-signal/50 sm:right-3" aria-label="Next screenshot">
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <span className="rounded-full border border-line bg-hull/90 px-2.5 py-1 font-mono text-[11px] text-fog">
                {slide + 1}/{n}
              </span>
              {!reduce && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-line bg-hull/90 text-fog hover:text-frost"
                  aria-label={paused || hovering ? "Resume slideshow" : "Pause slideshow"}
                  title={paused ? "Play" : hovering ? "Paused while hovering" : "Pause"}
                >
                  {paused || hovering ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>

            <div className="flex justify-center gap-2 border-t border-line px-3 py-3" role="tablist" aria-label={`${label} slides`}>
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={`Go to screenshot ${i + 1}`}
                  onClick={() => go(i)}
                  className={cn("h-1.5 rounded-full transition-[width,background-color]", i === slide ? "w-6 bg-signal" : "w-1.5 bg-line-strong hover:bg-fog")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Lightbox dialogRef={dialogRef} label={label} current={current} index={lightbox} total={n} images={images} onClose={close} onStep={lightboxStep} onSelect={open} />
    </>
  );
}

function Lightbox({
  dialogRef,
  label,
  current,
  index,
  total,
  images,
  onClose,
  onStep,
  onSelect,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  label: string;
  current: Img | null;
  index: number | null;
  total: number;
  images: Img[];
  onClose: () => void;
  onStep: (d: number) => void;
  onSelect: (i: number) => void;
}) {
  return (
    <dialog ref={dialogRef} onClose={onClose} aria-label={`${label} image viewer`} className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-abyss/92 backdrop:backdrop-blur-md">
      {current && index !== null && (
        <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="flex items-center justify-between px-4 py-3 text-sm text-fog sm:px-6">
            <span aria-live="polite">
              {index + 1} / {total}
            </span>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-hull-2 text-frost hover:bg-hull" aria-label="Close image viewer" autoFocus>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 sm:px-16" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure key={index} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.22 }} className="flex max-h-full flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.url} alt={current.alt || ""} className="max-h-[78vh] w-auto max-w-full rounded-lg border border-line object-contain" />
                {current.caption && <figcaption className="mt-3 max-w-2xl text-center text-sm text-fog">{current.caption}</figcaption>}
              </motion.figure>
            </AnimatePresence>
            {total > 1 && (
              <>
                <button type="button" onClick={() => onStep(-1)} className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-hull-2 text-frost hover:bg-hull sm:left-4" aria-label="Previous image">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => onStep(1)} className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-hull-2 text-frost hover:bg-hull sm:right-4" aria-label="Next image">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {total > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
              {images.map((img, i) => (
                <button key={img.url + i} type="button" onClick={() => onSelect(i)} className={cn("relative h-12 w-20 shrink-0 overflow-hidden rounded-md border", i === index ? "border-signal" : "border-line opacity-60 hover:opacity-100")} aria-label={`Show image ${i + 1}`} aria-current={i === index}>
                  <SmartImage src={img.url} alt="" fill sizes="80px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
