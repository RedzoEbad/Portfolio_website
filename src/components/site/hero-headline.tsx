/**
 * The page's one orchestrated entrance: each sentence rises from a mask while the
 * optical size sweeps from text cut to display cut. Pure CSS, so it runs without
 * JavaScript and is removed entirely under prefers-reduced-motion.
 */
export function HeroHeadline({ text, id }: { text: string; id: string }) {
  const lines = text.match(/[^.!?]+[.!?]?/g)?.map((l) => l.trim()).filter(Boolean) ?? [text];
  return (
    <h1 id={id} className="text-[clamp(2.75rem,6vw,5.4rem)] leading-[1] font-semibold tracking-[-0.022em]" aria-label={text}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]" aria-hidden="true">
          <span className="hero-line block" style={{ animationDelay: `${120 + i * 160}ms` }}>
            {line}
          </span>
        </span>
      ))}
    </h1>
  );
}
