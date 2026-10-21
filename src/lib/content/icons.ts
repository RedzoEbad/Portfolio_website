import { createElement } from "react";
import {
  Activity, Award, Binary, Bot, Boxes, BrainCircuit, Cloud, CloudCog, CodeXml, Container, Cpu, Database, FlaskConical,
  Gauge, GitBranch, Globe, HardDrive, Hexagon, KeyRound, Layers, Lightbulb, Lock, Network, Puzzle, Radar, Rocket,
  Server, ShieldCheck, Sparkles, Target, Terminal, Workflow, Wrench, Zap, type LucideIcon,
} from "lucide-react";

/** Icons an admin can assign to categories, impact items and skills. Stored by key in MongoDB. */
export const ICONS: Record<string, LucideIcon> = {
  cloud: Cloud,
  "cloud-cog": CloudCog,
  workflow: Workflow,
  activity: Activity,
  container: Container,
  boxes: Boxes,
  layers: Layers,
  "shield-check": ShieldCheck,
  lock: Lock,
  "key-round": KeyRound,
  code: CodeXml,
  terminal: Terminal,
  bot: Bot,
  brain: BrainCircuit,
  sparkles: Sparkles,
  network: Network,
  server: Server,
  database: Database,
  "git-branch": GitBranch,
  gauge: Gauge,
  radar: Radar,
  cpu: Cpu,
  "hard-drive": HardDrive,
  globe: Globe,
  rocket: Rocket,
  wrench: Wrench,
  zap: Zap,
  flask: FlaskConical,
  puzzle: Puzzle,
  hexagon: Hexagon,
  binary: Binary,
  target: Target,
  lightbulb: Lightbulb,
  award: Award,
};

export const ICON_KEYS = Object.keys(ICONS);

export function iconFor(key?: string | null): LucideIcon {
  return (key && ICONS[key]) || Hexagon;
}

/** Renders an icon by stored key (avoids creating component references during render). */
export function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  return createElement(iconFor(name), { className, "aria-hidden": true });
}
