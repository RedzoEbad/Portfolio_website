import { Globe, Mail } from "lucide-react";
import { GithubMark, LinkedinMark, XMark } from "@/components/ui/brand-icons";
import type { SettingsDTO } from "@/lib/content/types";
import { cn, isSafeHttpUrl } from "@/lib/utils";

export function socialItems(s: SettingsDTO) {
  const items: { label: string; href: string; icon: React.ReactNode; external: boolean }[] = [];
  if (isSafeHttpUrl(s.socials.github)) items.push({ label: "GitHub", href: s.socials.github, icon: <GithubMark className="h-4 w-4" />, external: true });
  if (isSafeHttpUrl(s.socials.linkedin)) items.push({ label: "LinkedIn", href: s.socials.linkedin, icon: <LinkedinMark className="h-4 w-4" />, external: true });
  if (isSafeHttpUrl(s.socials.x)) items.push({ label: "X", href: s.socials.x, icon: <XMark className="h-4 w-4" />, external: true });
  if (isSafeHttpUrl(s.socials.website)) items.push({ label: "Website", href: s.socials.website, icon: <Globe className="h-4 w-4" />, external: true });
  // Email is only exposed when the owner explicitly enables it.
  if (s.contact.showEmail && s.contact.email) items.push({ label: "Email", href: `mailto:${s.contact.email}`, icon: <Mail className="h-4 w-4" />, external: false });
  return items;
}

export function SocialLinks({ settings, className, withLabels = false }: { settings: SettingsDTO; className?: string; withLabels?: boolean }) {
  const items = socialItems(settings);
  if (!items.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((i) => (
        <li key={i.label}>
          <a
            href={i.href}
            {...(i.external ? { target: "_blank", rel: "noopener noreferrer me" } : {})}
            className={cn("inline-flex h-9 items-center gap-2 rounded-lg border border-line text-fog transition-colors hover:border-signal/60 hover:text-frost", withLabels ? "px-3 text-sm" : "w-9 justify-center")}
            aria-label={withLabels ? undefined : i.label}
          >
            {i.icon}
            {withLabels && i.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
