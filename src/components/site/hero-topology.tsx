"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery, useSafeReducedMotion } from "@/lib/hooks";

type Node = { id: string; label: string; x: number; y: number; color: string; note: string };

/** Coordinates in a 600×560 viewBox. The control plane sits slightly off-centre on purpose. */
const CENTER = { x: 300, y: 285 };
const NODES: Node[] = [
  { id: "aws", label: "AWS", x: 300, y: 70, color: "var(--signal)", note: "VPCs, IAM, managed services and multi-account foundations." },
  { id: "k8s", label: "Kubernetes", x: 498, y: 160, color: "#67b7ff", note: "Clusters, workloads, autoscaling and GitOps delivery." },
  { id: "tf", label: "Terraform", x: 528, y: 372, color: "var(--ion)", note: "Modules, remote state, drift detection and policy." },
  { id: "cicd", label: "CI/CD", x: 372, y: 500, color: "#2dd4bf", note: "Pipelines with tests, scans and progressive rollouts." },
  { id: "obs", label: "Observability", x: 160, y: 482, color: "#f5b84a", note: "Metrics, logs and traces wired for incident work." },
  { id: "sec", label: "Security", x: 62, y: 322, color: "var(--flare)", note: "Least privilege, secrets, scanning and guardrails." },
  { id: "ai", label: "AI agents", x: 120, y: 132, color: "#b78cff", note: "Agents that read telemetry and propose changes, with a human in the loop." },
];
const RING: [string, string][] = [
  ["tf", "aws"],
  ["cicd", "k8s"],
  ["obs", "ai"],
  ["sec", "cicd"],
  ["k8s", "aws"],
  ["obs", "k8s"],
];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function curve(a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return `M${a.x} ${a.y} Q${mx - dy * bend} ${my + dx * bend} ${b.x} ${b.y}`;
}

export function HeroTopology({ centerLabel }: { centerLabel: string }) {
  const reduce = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "80px 0px 80px 0px" });
  const [active, setActive] = useState<string | null>(null);
  const [tilting, setTilting] = useState(false);
  const fine = useMediaQuery("(pointer: fine) and (min-width: 1024px)");

  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const rotX = useTransform(py, [-1, 1], [6, -6]);
  const rotY = useTransform(px, [-1, 1], [-8, 8]);
  const nearX = useTransform(px, [-1, 1], [-14, 14]);
  const nearY = useTransform(py, [-1, 1], [-10, 10]);
  const parallax = fine && !reduce && tilting;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (inView && !reduce) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView, reduce]);

  const edges = [...NODES.map((n) => ["core", n.id] as [string, string]), ...RING];
  const point = (id: string) => (id === "core" ? CENTER : byId[id]);
  const lit = (a: string, b: string) => active !== null && (a === active || b === active || (active === "core" && a === "core"));
  const activeNode = active && active !== "core" ? byId[active] : null;

  return (
    <div
      ref={ref}
      className={cn("relative mx-auto aspect-[600/560] w-full max-w-[600px]", tilting && "[perspective:1200px]")}
      onPointerMove={(e) => {
        if (!fine || reduce || !ref.current) return;
        if (!tilting) setTilting(true);
        const r = ref.current.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width) * 2 - 1);
        py.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        setTilting(false);
        px.set(0);
        py.set(0);
      }}
    >
      <motion.div className="absolute inset-0" style={parallax ? { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" } : undefined}>
        <svg ref={svgRef} viewBox="0 0 600 560" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id="core-glow">
              <stop offset="0" stopColor="var(--signal)" stopOpacity="0.45" />
              <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
            </radialGradient>
            {edges.map(([a, b]) => (
              <path key={`${a}-${b}`} id={`edge-${a}-${b}`} d={curve(point(a), point(b), a === "core" ? 0.08 : 0.22)} />
            ))}
          </defs>

          {/* orbit rings */}
          {[110, 200, 250].map((r, i) => (
            <circle key={r} cx={CENTER.x} cy={CENTER.y} r={r} fill="none" stroke="var(--line-strong)" strokeDasharray={i === 1 ? "2 7" : undefined} strokeOpacity={i === 1 ? 1 : 0.45} />
          ))}
          <circle cx={CENTER.x} cy={CENTER.y} r="120" fill="url(#core-glow)" />

          {/* edges */}
          {edges.map(([a, b]) => {
            const on = lit(a, b);
            const color = b !== "core" ? byId[b]?.color : "var(--signal)";
            return (
              <use
                key={`l-${a}-${b}`}
                href={`#edge-${a}-${b}`}
                fill="none"
                stroke={on ? color : "var(--line-strong)"}
                strokeWidth={on ? 2 : 1.2}
                strokeOpacity={active && !on ? 0.35 : 1}
                style={{ transition: "stroke 250ms, stroke-width 250ms, stroke-opacity 250ms" }}
              />
            );
          })}

          {/* packets: SMIL motion along each edge; omitted entirely for reduced motion */}
          {!reduce &&
            edges.map(([a, b], i) => (
              <circle key={`p-${a}-${b}`} r={a === "core" ? 2.6 : 2} fill={b !== "core" ? byId[b].color : "var(--signal)"}>
                <animateMotion dur={`${3 + (i % 4) * 0.7}s`} begin={`${(i * 0.37) % 2.5}s`} repeatCount="indefinite" keyPoints={i % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear">
                  <mpath href={`#edge-${a}-${b}`} />
                </animateMotion>
              </circle>
            ))}
        </svg>

        {/* Nodes are real buttons so they work with keyboard and screen readers */}
        <motion.div className="absolute inset-0" style={parallax ? { x: nearX, y: nearY } : undefined}>
          <button
            type="button"
            onPointerEnter={() => setActive("core")}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive("core")}
            onBlur={() => setActive(null)}
            className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-signal/60 bg-hull px-4 py-3 text-center shadow-[0_0_60px_-10px_var(--glow-signal)]"
            style={{ left: `${(CENTER.x / 600) * 100}%`, top: `${(CENTER.y / 560) * 100}%` }}
            aria-label={`${centerLabel}: control plane connecting every domain`}
          >
            <span className="font-mono text-[10px] text-signal">control-plane</span>
            <span className="text-sm font-semibold">{centerLabel}</span>
          </button>
          {NODES.map((n, i) => (
            <motion.button
              key={n.id}
              data-reveal=""
              type="button"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
              onPointerEnter={() => setActive(n.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              aria-describedby={active === n.id ? "topology-note" : undefined}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border bg-hull py-1.5 pr-3 pl-1.5 text-xs font-medium whitespace-nowrap transition-[border-color,box-shadow] sm:text-sm",
                active === n.id ? "border-[var(--c)] shadow-[0_0_28px_-6px_var(--c)]" : "border-line-strong",
              )}
              style={{ left: `${(n.x / 600) * 100}%`, top: `${(n.y / 560) * 100}%`, ["--c" as string]: n.color }}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${n.color} 22%, transparent)` }}>
                <span className="h-2 w-2 rounded-full" style={{ background: n.color }} />
              </span>
              {n.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      <div id="topology-note" aria-live="polite" className="glass absolute right-0 bottom-0 left-0 mx-auto w-fit max-w-[92%] rounded-lg px-3 py-2 font-mono text-[11px] text-fog sm:text-xs">
        {activeNode ? (
          <>
            <span style={{ color: activeNode.color }}>{activeNode.label.toLowerCase().replace(/\s/g, "-")}</span> <span className="text-frost/80">{activeNode.note}</span>
          </>
        ) : active === "core" ? (
          <span className="text-frost/80">One engineer, every layer: from cloud accounts to the agents running on top.</span>
        ) : (
          <span>
            <span className="text-signal">$</span> hover or tab through a node to inspect it
          </span>
        )}
      </div>
    </div>
  );
}
