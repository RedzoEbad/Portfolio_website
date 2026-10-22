"use client";

import { Gallery } from "@/components/content/gallery";
import { Reveal } from "@/components/motion/primitives";
import type { Img } from "@/lib/content/types";
import { Container, SectionHeader } from "./section-header";

/** Homepage image wall — LinkedIn screenshots, photos, announcements. */
export function SpotlightSection({
  title,
  lede,
  images,
}: {
  title: string;
  lede?: string;
  images: Img[];
}) {
  if (!images.length) return null;

  return (
    <section id="gallery" className="scroll-mt-24 border-t border-line py-16 sm:py-24 md:py-32" aria-labelledby="spotlight-title">
      <Container wide>
        <Reveal variant="rise">
          <SectionHeader
            id="spotlight-title"
            index="06 — Gallery"
            align="split"
            title={title || "Snapshots"}
            lede={lede || "LinkedIn moments, screenshots, and bits of the journey worth keeping visible."}
          />
        </Reveal>

        <Reveal variant="blur" delay={0.06}>
          <Gallery images={images} layout="mosaic" label={title || "Gallery"} />
        </Reveal>
      </Container>
    </section>
  );
}
