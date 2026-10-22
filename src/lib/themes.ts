/** Public site themes — class names match next-themes + globals.css. */
export const THEMES = [
  {
    id: "dark",
    label: "Cyan abyss",
    blurb: "Deep navy with cyan signal",
    swatches: ["#050816", "#2ee6f5", "#9d6bff"],
    scheme: "dark" as const,
  },
  {
    id: "light",
    label: "Cool paper",
    blurb: "Soft light with teal ink",
    swatches: ["#f3f6fb", "#067a8c", "#6d3fe0"],
    scheme: "light" as const,
  },
  {
    id: "aubergine",
    label: "Aubergine gold",
    blurb: "Ice silver, deep aubergine, marigold blur",
    swatches: ["#140816", "#e8eef6", "#f0b429"],
    scheme: "dark" as const,
  },
  {
    id: "neon",
    label: "Jet neon",
    blurb: "Jet black, cerulean, neon rose",
    swatches: ["#050507", "#00b4d8", "#ff2e63"],
    scheme: "dark" as const,
  },
  {
    id: "onyx",
    label: "Onyx atelier",
    blurb: "White onyx & angora with sage, turquoise, fuchsia",
    swatches: ["#f6f3ee", "#1fb5a6", "#d946a8"],
    scheme: "light" as const,
  },
  {
    id: "maroon",
    label: "Maroon grove",
    blurb: "Maroon, dark green, and warm gold",
    swatches: ["#0c1a14", "#8b2e3b", "#c9a227"],
    scheme: "dark" as const,
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export const THEME_IDS = THEMES.map((t) => t.id);
export const DEFAULT_THEME: ThemeId = "neon";

export function themeMeta(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
