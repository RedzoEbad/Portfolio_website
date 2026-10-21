import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative max-w-lg text-center">
        <p className="font-mono text-sm text-fog">
          <span className="text-flare">404</span> · route not found in this cluster
        </p>
        <h1 className="mt-4 text-4xl tracking-tight md:text-5xl">This page doesn&apos;t exist</h1>
        <p className="mt-4 text-fog">It may have been unpublished, renamed, or the link has a typo.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass("primary", "md")}>
            Go to the homepage
          </Link>
          <Link href="/projects" className={buttonClass("secondary", "md")}>
            Browse projects
          </Link>
        </div>
      </div>
    </main>
  );
}
