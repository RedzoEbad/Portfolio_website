"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { DEFAULT_THEME, THEME_IDS } from "@/lib/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME} themes={[...THEME_IDS]} enableSystem={false} disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{ classNames: { toast: "!bg-hull !text-frost !border !border-line-strong !rounded-xl !font-sans", description: "!text-fog" } }}
        />
      </MotionConfig>
    </ThemeProvider>
  );
}
