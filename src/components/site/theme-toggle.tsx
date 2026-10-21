"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@/lib/hooks";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();
  const dark = !mounted || resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid h-9 w-9 place-items-center rounded-lg text-fog transition-colors hover:bg-hull-2 hover:text-frost"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
