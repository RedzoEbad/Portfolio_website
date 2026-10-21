"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Node = { id: string; label: string; x: number; y: number; color: string; note: string };

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

/** Lightweight static diagram — note sits below the graphic so it never covers nodes on mobile. */
export function HeroTopology({ centerLabel }: { centerLabel: string }) {
  const [active, setActive] = useState<string | null>(null);
  const edges = [...NODES.map((n) => ["core", n.id] as [string, string]), ...RING];
  const point = (id: string) => (id === "core" ? CENTER : byId[id]);
  const lit = (a: string, b: string) => active !== null && (a === active || b === active || (active === "core" && a === "core"));
  const activeNode = active && active !== "core" ? byId[active] : null;
  const note =
    activeNode != null
      ? { color: activeNode.color, label: activeNode.label.toLowerCase().replace(/\s/g, "-"), body: activeNode.note }
      : active === "core"
        ? { color: null as string | null, label: null as string | null, body: "One engineer, every layer: from cloud accounts to the agents running on top." }
        : null;

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div className="relative aspect-[600/560] w-full">
        <svg viewBox="0 0 600 560" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id="core-glow">
              <stop offset="0" stopColor="var(--signal)" stopOpacity="0.4" />
              <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[110, 200, 250].map((r, i) => (
            <circle key={r} cx={CENTER.x} cy={CENTER.y} r={r} fill="none" stroke="var(--line-strong)" strokeDasharray={i === 1 ? "2 7" : undefined} strokeOpacity={i === 1 ? 1 : 0.45} />
          ))}
          <circle cx={CENTER.x} cy={CENTER.y} r="120" fill="url(#core-glow)" />
          {edges.map(([a, b]) => {
            const on = lit(a, b);
            const color = b !== "core" ? byId[b]?.color : "var(--signal)";
            return (
              <path
                key={`l-${a}-${b}`}
                d={curve(point(a), point(b), a === "core" ? 0.08 : 0.22)}
                fill="none"
                stroke={on ? color : "var(--line-strong)"}
                strokeWidth={on ? 2 : 1.2}
                strokeOpacity={active && !on ? 0.35 : 1}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0">
          <button
            type="button"
            onPointerEnter={() => setActive("core")}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive("core")}
            onBlur={() => setActive(null)}
            className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-signal/60 bg-hull px-3 py-2.5 text-center shadow-[0_0_60px_-10px_var(--glow-signal)] sm:px-4 sm:py-3"
            style={{ left: `${(CENTER.x / 600) * 100}%`, top: `${(CENTER.y / 560) * 100}%` }}
            aria-label={`${centerLabel}: control plane connecting every domain`}
            aria-describedby={active === "core" ? "topology-note" : undefined}
          >
            <span className="font-mono text-[10px] text-signal">control-plane</span>
            <span className="text-sm font-semibold">{centerLabel}</span>
          </button>
          {NODES.map((n) => (
            <button
              key={n.id}
              type="button"
              onPointerEnter={() => setActive(n.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              aria-describedby={active === n.id ? "topology-note" : undefined}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border bg-hull py-1 pr-2.5 pl-1 text-[11px] font-medium whitespace-nowrap sm:gap-2 sm:py-1.5 sm:pr-3 sm:pl-1.5 sm:text-sm",
                active === n.id ? "border-[var(--c)] shadow-[0_0_28px_-6px_var(--c)]" : "border-line-strong",
              )}
              style={{ left: `${(n.x / 600) * 100}%`, top: `${(n.y / 560) * 100}%`, ["--c" as string]: n.color }}
            >
              <span className="grid h-4 w-4 place-items-center rounded-full sm:h-5 sm:w-5" style={{ background: `color-mix(in srgb, ${n.color} 22%, transparent)` }}>
                <span className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2" style={{ background: n.color }} />
              </span>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Below the diagram (not overlaid) so mobile taps never cover nodes */}
      <div id="topology-note" aria-live="polite" className="mt-3 min-h-[2.75rem] px-1 text-center font-mono text-[11px] leading-relaxed text-fog sm:mt-4 sm:min-h-[3rem] sm:text-xs">
        {note ? (
          <>
            {note.label && (
              <span className="font-medium" style={{ color: note.color ?? undefined }}>
                {note.label}{" "}
              </span>
            )}
            <span className="text-frost/80">{note.body}</span>
          </>
        ) : (
          <span className="sr-only">Select a node to read more about that area.</span>
        )}
      </div>
    </div>
  );
}
