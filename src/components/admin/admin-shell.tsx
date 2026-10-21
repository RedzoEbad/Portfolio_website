"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Award, ExternalLink, FileText, FolderKanban, Inbox, LayoutDashboard, LogOut, Menu, Milestone, Settings, Tags, User, Wrench, X } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";
import { useResetOn } from "@/lib/hooks";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/categories", label: "Domains", icon: Tags },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/timeline", label: "Timeline", icon: Milestone },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/account", label: "Account", icon: User },
];

function SideNav({ unread, onNavigate }: { unread: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {NAV.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        const Icon = n.icon;
        return (
          <li key={n.href}>
            <Link href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", active ? "text-frost" : "text-fog hover:bg-hull-2 hover:text-frost")}>
              {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-lg border border-line-strong bg-hull-2" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <Icon className={cn("relative h-4 w-4", active && "text-signal")} aria-hidden="true" />
              <span className="relative">{n.label}</span>
              {n.href === "/admin/messages" && unread > 0 && <span className="relative ml-auto rounded-full bg-signal px-1.5 font-mono text-[10px] text-signal-ink">{unread}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({ children, email, siteName, unread }: { children: React.ReactNode; email: string; siteName: string; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useResetOn(pathname);

  const footer = (
    <div className="space-y-2 border-t border-line p-3">
      <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fog hover:bg-hull-2 hover:text-frost">
        <ExternalLink className="h-4 w-4" /> View public site
      </Link>
      <div className="flex items-center justify-between gap-2 px-3">
        <span className="truncate text-xs text-fog" title={email}>
          {email}
        </span>
        <div className="flex items-center">
          <ThemeToggle />
          <form action={logoutAction}>
            <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg text-fog hover:bg-hull-2 hover:text-frost" aria-label="Sign out" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-hull/60 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <span className="h-2 w-2 rounded-full bg-signal" />
          <span className="truncate font-semibold">{siteName}</span>
          <span className="ml-auto font-mono text-[10px] text-fog">admin</span>
        </div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
          <SideNav unread={unread} />
        </nav>
        {footer}
      </aside>

      <header className="glass sticky top-0 z-40 flex h-14 items-center gap-3 border-x-0 border-t-0 px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-hull-2" aria-label="Open admin menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">{siteName}</span>
        <span className="font-mono text-[10px] text-fog">admin</span>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-abyss/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.aside role="dialog" aria-modal="true" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line-strong bg-hull" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}>
              <div className="flex h-14 items-center justify-between border-b border-line px-4">
                <span className="font-semibold">{siteName}</span>
                <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-hull-2" aria-label="Close admin menu" autoFocus>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
                <SideNav unread={unread} onNavigate={() => setOpen(false)} />
              </nav>
              {footer}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
