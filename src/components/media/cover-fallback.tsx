/** Deterministic generated artwork for projects without a cover: a small topology in the category colour. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function CoverFallback({ seed, color = "#2ee6f5", label }: { seed: string; color?: string; label?: string }) {
  const rnd = hash(seed);
  const nodes = Array.from({ length: 9 }, () => ({ x: 40 + rnd() * 520, y: 30 + rnd() * 280, r: 3 + rnd() * 5 }));
  // Connect each node to its nearest neighbour(s): reads as a deliberate graph, not a scribble.
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, i % 3 === 0 ? 2 : 1);
    near.forEach(({ j }) => {
      const k = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(k)) {
        seen.add(k);
        edges.push([i, j]);
      }
    });
  });
  const id = `cf-${seed.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`;
  return (
    <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={label ? `Generated illustration for ${label}` : "Generated illustration"}>
      <defs>
        <radialGradient id={`${id}-g`} cx="70%" cy="20%" r="80%">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-p`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeOpacity="0.07" />
        </pattern>
      </defs>
      <rect width="600" height="340" className="fill-hull-2" />
      <rect width="600" height="340" fill={`url(#${id}-p)`} className="text-frost" />
      <rect width="600" height="340" fill={`url(#${id}-g)`} />
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={color} strokeOpacity="0.35" strokeWidth="1" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r + 6} fill={color} fillOpacity="0.08" />
          <circle cx={n.x} cy={n.y} r={n.r} fill={color} fillOpacity={i === 0 ? 0.95 : 0.55} />
        </g>
      ))}
    </svg>
  );
}
