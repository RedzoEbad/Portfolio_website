"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const db = /MONGODB_URI|ECONNREFUSED|Server selection|querySrv|AUTH_SECRET/i.test(error.message);
  return (
    <main className="relative grid min-h-dvh place-items-center px-4">
      <div className="max-w-lg text-center">
        <p className="font-mono text-sm text-fog">
          <span className="text-flare">500</span> {error.digest ? `· ${error.digest}` : ""}
        </p>
        <h1 className="mt-4 text-4xl tracking-tight">Something went wrong loading this page</h1>
        <p className="mt-4 text-fog">{db ? "The site couldn't reach its database or is missing configuration. If you run this site, check MONGODB_URI, AUTH_SECRET and Atlas network access." : "Try again. If the problem continues, come back in a few minutes."}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={reset} className={buttonClass("primary", "md")}>
            Try again
          </button>
          <Link href="/" className={buttonClass("secondary", "md")}>
            Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
