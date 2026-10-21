import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";

export function AdminHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-fog">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, children, className, actions }: { title?: string; description?: React.ReactNode; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-hull/50", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-fog">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const STATUS_STYLE: Record<string, string> = {
  published: "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#2dd4bf]",
  draft: "border-line-strong bg-hull-2 text-fog",
  scheduled: "border-[#f5b84a]/40 bg-[#f5b84a]/10 text-[#f5b84a]",
};
export function StatusPill({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs capitalize", STATUS_STYLE[status] ?? STATUS_STYLE.draft)}>{status}</span>;
}

export function AdminEmpty({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-fog">{body}</p>
      {action && (
        <Link href={action.href} className={buttonClass("primary", "md", "mt-5")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function AdminPager({ page, pages, base, params }: { page: number; pages: number; base: string; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && k !== "page" && sp.set(k, v));
    if (p > 1) sp.set("page", String(p));
    return `${base}?${sp.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm text-fog">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className={buttonClass("secondary", "sm")}>
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className={buttonClass("secondary", "sm")}>
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
