"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useResetOn } from "@/lib/hooks";
import { ThemeToggle } from "./theme-toggle";
import { GithubMark } from "@/components/ui/brand-icons";
import { Dialog } from "@/components/ui/dialog";

type NavLink = { label: string; href: string };
type Domain = { name: string; slug: string; color: string };

export function SiteNav({ siteName, links, githubUrl, domains }: { siteName: string; links: NavLink[]; githubUrl?: string; domains: Domain[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useResetOn(pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 30);
  }, [searchOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href.split("?")[0]));
  const initials = siteName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <a href="#main" className="sr-only z-[60] rounded-md bg-signal px-3 py-2 text-signal-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            "mx-auto transition-all duration-300",
            scrolled ? "mt-2 max-w-[min(96vw,72rem)] px-2 sm:mt-3 sm:px-3" : "max-w-7xl px-4 sm:px-6 lg:px-8",
          )}
        >
          <nav
            className={cn(
              "flex h-14 items-center gap-3 transition-all duration-300 sm:h-16 sm:gap-5",
              scrolled ? "glass rounded-2xl border border-line-strong px-3 shadow-[0_16px_50px_-28px_rgba(0,0,0,0.55)] sm:px-4" : "border-b border-transparent bg-transparent",
            )}
            aria-label="Main"
          >
            <Link href="/" className="group flex min-w-0 items-center gap-2.5 font-semibold" aria-label={`${siteName}, home`}>
              <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-signal/45 bg-signal/10 font-mono text-xs text-signal transition-all group-hover:bg-signal/20 group-hover:shadow-[0_0_24px_-6px_var(--glow-signal)]">
                {initials || "~"}
              </span>
              <span className="hidden truncate tracking-tight sm:inline" style={{ fontVariationSettings: '"opsz" 36' }}>
                {siteName}
              </span>
            </Link>

            <ul className="ml-1 hidden items-center gap-0.5 md:flex lg:ml-4">
              {links.map((l) => (
                <li key={l.href} className="relative">
                  <Link
                    href={l.href}
                    className={cn("relative block rounded-lg px-3 py-2 text-sm transition-colors", isActive(l.href) ? "text-frost" : "text-fog hover:text-frost")}
                    aria-current={isActive(l.href) ? "page" : undefined}
                  >
                    {l.label}
                    {isActive(l.href) && (
                      <motion.span layoutId="nav-active" className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-signal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-xl border border-line px-3 text-sm text-fog transition-colors hover:border-line-strong hover:text-frost sm:flex"
                aria-label="Search projects and articles"
              >
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="rounded border border-line px-1.5 text-[11px]">/</kbd>
              </button>
              <button type="button" onClick={() => setSearchOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl text-fog hover:bg-hull-2 hover:text-frost sm:hidden" aria-label="Search">
                <Search className="h-[18px] w-[18px]" />
              </button>
              <ThemeToggle />
              {githubUrl ? (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="ml-1 hidden h-9 items-center gap-2 rounded-xl bg-frost px-3.5 text-sm font-medium text-abyss transition hover:bg-signal md:inline-flex">
                  <GithubMark className="h-4 w-4" />
                  GitHub
                </a>
              ) : (
                <Link href="/projects" className="ml-1 hidden h-9 items-center rounded-xl bg-frost px-3.5 text-sm font-medium text-abyss transition hover:bg-signal md:inline-flex">
                  Work
                </Link>
              )}
              <button type="button" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl text-frost hover:bg-hull-2 md:hidden" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-nav">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-abyss/75" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.aside
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col border-l border-line-strong bg-hull"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <span className="font-mono text-xs tracking-wider text-fog uppercase">Menu</span>
                <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-hull-2" aria-label="Close menu" autoFocus>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ul className="space-y-1">
                  {[{ label: "Home", href: "/" }, ...links].map((l, i) => (
                    <motion.li key={l.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.05 }}>
                      <Link href={l.href} className={cn("block rounded-xl px-3 py-3.5 text-2xl font-medium tracking-tight", isActive(l.href) ? "bg-hull-2 text-signal" : "text-frost")}>
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                {domains.length > 0 && (
                  <div className="mt-10">
                    <p className="mb-3 px-3 font-mono text-[11px] tracking-wider text-fog uppercase">Domains</p>
                    <ul className="space-y-1">
                      {domains.map((d) => (
                        <li key={d.slug}>
                          <Link href={`/categories/${d.slug}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-frost hover:bg-hull-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                            {d.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {githubUrl && (
                <div className="border-t border-line p-5">
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-frost font-medium text-abyss">
                    <GithubMark className="h-4 w-4" /> Visit GitHub
                  </a>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} title="Search" description="Find projects, technologies and articles.">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q")?.toString().trim();
            setSearchOpen(false);
            if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
          }}
          className="flex gap-2"
        >
          <label htmlFor="site-search" className="sr-only">
            Search
          </label>
          <input ref={searchRef} id="site-search" name="q" placeholder="Terraform, Kubernetes, incident…" className="h-11 flex-1 rounded-xl border border-line-strong bg-abyss px-3 text-frost placeholder:text-fog focus:border-signal focus:outline-none" />
          <button type="submit" className="h-11 rounded-xl bg-signal px-4 font-medium text-signal-ink">
            Search
          </button>
        </form>
      </Dialog>
    </>
  );
}
