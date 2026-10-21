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
        setScrolled(window.scrollY > 24);
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
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-200", scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent bg-transparent")}>
        <nav className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-8" aria-label="Main">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 font-semibold" aria-label={`${siteName}, home`}>
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-signal/50 bg-signal/10 font-mono text-xs text-signal transition-colors group-hover:bg-signal/20 group-hover:shadow-[0_0_20px_-4px_var(--glow-signal)]">
              {initials || "~"}
              <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-signal pulse-dot" />
            </span>
            <span className="hidden truncate tracking-tight sm:inline" style={{ fontVariationSettings: '"opsz" 36' }}>
              {siteName}
            </span>
          </Link>

          <ul className="ml-2 hidden items-center gap-1 lg:ml-4 md:flex">
            {links.map((l) => (
              <li key={l.href} className="relative">
                <Link href={l.href} className={cn("relative block rounded-md px-3 py-2 text-sm transition-colors", isActive(l.href) ? "text-frost" : "text-fog hover:text-frost")} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                  {isActive(l.href) && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-px h-px bg-signal" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => setSearchOpen(true)} className="hidden h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-fog transition-colors hover:border-line-strong hover:text-frost sm:flex" aria-label="Search projects and articles">
              <Search className="h-4 w-4" />
              <span>Search</span>
              <kbd className="rounded border border-line px-1.5 text-[11px]">/</kbd>
            </button>
            <button type="button" onClick={() => setSearchOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost sm:hidden" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <ThemeToggle />
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="ml-1 hidden h-9 items-center gap-2 rounded-lg bg-frost px-3.5 text-sm font-medium text-abyss transition hover:bg-signal md:inline-flex">
                <GithubMark className="h-4 w-4" />
                GitHub
              </a>
            ) : (
              <Link href="/projects" className="ml-1 hidden h-9 items-center rounded-lg bg-frost px-3.5 text-sm font-medium text-abyss transition hover:bg-signal md:inline-flex">
                View my work
              </Link>
            )}
            <button type="button" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-frost hover:bg-hull-2 md:hidden" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-nav">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-abyss/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.aside
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col border-l border-line-strong bg-hull"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <span className="font-mono text-sm text-fog">~/menu</span>
                <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-hull-2" aria-label="Close menu" autoFocus>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <ul className="space-y-1">
                  {[{ label: "Home", href: "/" }, ...links].map((l, i) => (
                    <motion.li key={l.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                      <Link href={l.href} className={cn("block rounded-lg px-3 py-3 text-2xl font-medium", isActive(l.href) ? "bg-hull-2 text-signal" : "text-frost")}>
                        {l.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                {domains.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-2 px-3 text-sm text-fog">Engineering domains</p>
                    <ul>
                      {domains.map((d) => (
                        <li key={d.slug}>
                          <Link href={`/categories/${d.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-frost hover:bg-hull-2">
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
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-frost font-medium text-abyss">
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
          <input ref={searchRef} id="site-search" name="q" placeholder="Terraform, Kubernetes, incident…" className="h-11 flex-1 rounded-lg border border-line-strong bg-abyss px-3 text-frost placeholder:text-fog focus:border-signal focus:outline-none" />
          <button type="submit" className="h-11 rounded-lg bg-signal px-4 font-medium text-signal-ink">
            Search
          </button>
        </form>
      </Dialog>
    </>
  );
}
