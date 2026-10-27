import { GraduationCap, MonitorPlay, Play, type LucideIcon } from "lucide-react"

import { PLATFORMS, type Difficulty, type LearningResource, type Platform } from "@/mock/sources/resources"
import { cn } from "@/lib/utils"

/** Platform styling uses theme tokens, not brand colors, so it stays inside the design system. */
const STYLE: Record<Platform, { icon: LucideIcon; badge: string; thumb: string; mark: string }> = {
  youtube: {
    icon: Play,
    badge: "border-destructive/25 bg-destructive/8 text-destructive",
    thumb: "bg-destructive/6",
    mark: "bg-destructive text-white",
  },
  udemy: {
    icon: MonitorPlay,
    badge: "border-highlight/60 bg-highlight/15 text-highlight-foreground",
    thumb: "bg-highlight/15",
    mark: "bg-highlight text-highlight-foreground",
  },
  coursera: {
    icon: GraduationCap,
    badge: "border-primary/25 bg-primary/8 text-primary",
    thumb: "bg-primary/7",
    mark: "bg-primary text-primary-foreground",
  },
}

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  const { icon: Icon, badge } = STYLE[platform]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", badge, className)}>
      <Icon aria-hidden="true" className="size-3" />
      {PLATFORMS[platform].label}
    </span>
  )
}

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const { icon: Icon } = STYLE[platform]
  return <Icon aria-hidden="true" className={className} />
}

/**
 * Typographic thumbnail. Real thumbnails would come from the platform's API; sample data has
 * none, so this shows the course, format, and platform instead of a stock image.
 */
export function ResourceThumbnail({
  resource,
  courseCode,
  className,
}: {
  resource: LearningResource
  courseCode?: string
  className?: string
}) {
  const { icon: Icon, thumb, mark } = STYLE[resource.platform]
  const code = courseCode ?? resource.courseCodes[0]
  return (
    <div aria-hidden="true" className={cn("relative flex aspect-[16/7] flex-col justify-between overflow-hidden bg-card p-3.5", className)}>
      <span className={cn("absolute inset-0", thumb)} />
      <div className="relative flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{resource.format}</span>
        <span className={cn("grid size-7 place-items-center rounded-full", mark)}>
          <Icon className="size-3.5" />
        </span>
      </div>
      <p className="relative font-display text-3xl leading-none tracking-tight text-foreground/80">{code}</p>
    </div>
  )
}

const LEVEL: Record<Difficulty, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }

export function DifficultyLabel({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className="flex items-end gap-px">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn("w-[3px] rounded-sm", bar <= LEVEL[difficulty] ? "bg-foreground/70" : "bg-border")}
            style={{ height: `${4 + bar * 2}px` }}
          />
        ))}
      </span>
      {difficulty}
    </span>
  )
}
