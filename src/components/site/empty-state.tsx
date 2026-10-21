import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

/** Honest empty state: says what's missing and where it comes from, no placeholder claims. */
export function EmptyState({ title, body, action, command }: { title: string; body: string; action?: { href: string; label: string }; command?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-line-strong bg-hull/40 px-6 py-14 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-md">
        {command && (
          <p className="mb-5 font-mono text-sm text-fog">
            <span className="text-signal">$</span> {command}
            <br />
            <span className="text-fog/70">0 results</span>
          </p>
        )}
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-fog">{body}</p>
        {action && (
          <Link href={action.href} className={buttonClass("secondary", "md", "mt-6")}>
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
