"use client";

import Link from "next/link";
import { ArrowUpRight, Award, BookOpen, Briefcase, GraduationCap, Lightbulb, Rocket, Wrench } from "lucide-react";
import type { TimelineDTO } from "@/lib/content/types";
import { formatDate, isSafeHttpUrl } from "@/lib/utils";

const KIND = {
  certification: { icon: Award, label: "Certification", color: "#f5b84a" },
  project: { icon: Rocket, label: "Project", color: "var(--signal)" },
  skill: { icon: Wrench, label: "Skill", color: "#2dd4bf" },
  lesson: { icon: Lightbulb, label: "Lesson", color: "var(--ion)" },
  achievement: { icon: BookOpen, label: "Achievement", color: "#67b7ff" },
  role: { icon: Briefcase, label: "Role", color: "var(--flare)" },
  education: { icon: GraduationCap, label: "Education", color: "#7ee0b5" },
} as const;

function EventTitle({ title, link }: { title: string; link: string }) {
  if (isSafeHttpUrl(link)) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 hover:text-signal">
        {title}
        <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100" aria-hidden="true" />
      </a>
    );
  }
  if (link.startsWith("/") && !link.startsWith("//")) {
    return (
      <Link href={link} className="group inline-flex items-center gap-1 hover:text-signal">
        {title}
        <ArrowUpRight className="h-4 w-4 opacity-60 group-hover:opacity-100" aria-hidden="true" />
      </Link>
    );
  }
  return <>{title}</>;
}

/** Static spine — no scroll-linked motion (that made wheel input feel delayed). */
export function Timeline({ events }: { events: TimelineDTO[] }) {
  return (
    <ol className="relative ml-3 md:ml-[11rem]">
      <span className="absolute top-2 bottom-2 left-0 w-px bg-gradient-to-b from-signal via-ion to-flare opacity-70" aria-hidden="true" />
      {events.map((e) => {
        const k = KIND[e.kind as keyof typeof KIND] ?? KIND.achievement;
        const Icon = k.icon;
        return (
          <li key={e._id} className="relative pb-12 pl-10 last:pb-0">
            <span className="absolute top-1 -left-[13px] grid h-[26px] w-[26px] place-items-center rounded-full border bg-abyss" style={{ borderColor: k.color, color: k.color }}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <time dateTime={e.date} className="mb-1 block font-mono text-xs text-fog md:absolute md:top-1.5 md:-left-[11rem] md:w-[9rem] md:text-right">
              {formatDate(e.date, { year: "numeric", month: "short" })}
            </time>
            <p className="text-xs" style={{ color: k.color }}>
              {k.label}
            </p>
            <h3 className="mt-1 text-xl font-medium tracking-tight">
              <EventTitle title={e.title} link={e.link || ""} />
            </h3>
            {e.description && <p className="mt-2 max-w-2xl text-fog">{e.description}</p>}
          </li>
        );
      })}
    </ol>
  );
}
