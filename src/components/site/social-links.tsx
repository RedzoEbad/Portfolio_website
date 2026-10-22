import type { ReactNode } from "react";
import { Globe, Mail } from "lucide-react";
import { GithubMark, LinkedinMark, XMark } from "@/components/ui/brand-icons";
import type { SettingsDTO } from "@/lib/content/types";
import { cn, isSafeHttpUrl } from "@/lib/utils";

export function socialItems(s: SettingsDTO) {
  const items: { label: string; href: string; icon: ReactNode; external: boolean; display?: string }[] = [];
  if (isSafeHttpUrl(s.socials.github)) items.push({ label: "GitHub", href: s.socials.github, icon: <GithubMark className="h-4 w-4" />, external: true });
  if (isSafeHttpUrl(s.socials.linkedin)) items.push({ label: "LinkedIn", href: s.socials.linkedin, icon: <LinkedinMark className="h-4 w-4" />, external: true });
  if (isSafeHttpUrl(s.socials.x)) items.push({ label: "X", href: s.socials.x, icon: <XMark className="h-4 w-4" />, external: true });
  if (isSafeHttpUrl(s.socials.website)) items.push({ label: "Website", href: s.socials.website, icon: <Globe className="h-4 w-4" />, external: true });
  if (s.contact.showEmail && s.contact.email) {
    items.push({ label: "Email", href: `mailto:${s.contact.email}`, icon: <Mail className="h-4 w-4" />, external: false, display: s.contact.email });
  }
  return items;
}

export function SocialLinks({ settings, className, withLabels = false }: { settings: SettingsDTO; className?: string; withLabels?: boolean }) {
  const items = socialItems(settings);
  if (!items.length) return null;

  if (withLabels) {
    return (
      <ul className={cn("flex flex-col gap-2.5", className)}>
        {items.map((i) => (
          <li key={i.label}>
            <a
              href={i.href}
              {...(i.external ? { target: "_blank", rel: "noopener noreferrer me" } : {})}
              className="group flex max-w-md items-center gap-3 rounded-2xl border border-line/70 bg-hull/35 px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/40 hover:bg-hull/70"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line/80 bg-hull-2 text-fog transition-colors group-hover:border-signal/40 group-hover:text-signal">
                {i.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] tracking-[0.16em] text-fog uppercase">{i.label}</span>
                <span className="mt-0.5 block truncate text-sm text-frost transition-colors group-hover:text-signal">{i.display ?? i.label}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((i) => (
        <li key={i.label}>
          <a
            href={i.href}
            {...(i.external ? { target: "_blank", rel: "noopener noreferrer me" } : {})}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/80 bg-hull/40 text-fog transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/50 hover:bg-hull-2 hover:text-signal"
            aria-label={i.label}
            title={i.label}
          >
            {i.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
