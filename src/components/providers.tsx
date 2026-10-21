"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
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
