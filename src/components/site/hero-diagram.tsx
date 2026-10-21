"use client";

import dynamic from "next/dynamic";

const HeroTopology = dynamic(() => import("./hero-topology").then((m) => m.HeroTopology), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-[600/560] w-full max-w-[600px] rounded-2xl border border-line bg-hull/50" aria-hidden="true" />,
});

/** Defers the heavy SVG/motion diagram so hero text paints first. */
export function HeroDiagram({ centerLabel }: { centerLabel: string }) {
  return <HeroTopology centerLabel={centerLabel} />;
}
