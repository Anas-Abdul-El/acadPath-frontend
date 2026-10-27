import { ArrowRight, Clock } from "lucide-react"

import { DifficultyLabel, PlatformBadge, ResourceThumbnail } from "@/components/webApp/sources/platform"
import { Button } from "@/components/ui/button"
import type { LearningResource } from "@/mock/sources/resources"

type ResourceCardProps = {
  resource: LearningResource
  /** Course the card is shown for; defaults to the resource's first course. */
  courseCode?: string
  onOpen: (resource: LearningResource) => void
  /** Heading level for the title, so cards fit the surrounding outline. */
  headingLevel?: 3 | 4 | 5
}

export function ResourceCard({ resource, courseCode, onOpen, headingLevel = 3 }: ResourceCardProps) {
  const Heading = `h${headingLevel}` as const
  const headingId = `resource-${resource.id}-${courseCode ?? "any"}`
  return (
    <article aria-labelledby={headingId} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      <ResourceThumbnail resource={resource} courseCode={courseCode} className="border-b border-border" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={resource.platform} />
          {(courseCode ? [courseCode] : resource.courseCodes.slice(0, 2)).map((code) => (
            <span key={code} className="rounded border border-border px-1.5 py-px font-mono text-[11px] text-muted-foreground">
              {code}
            </span>
          ))}
          {!resource.verified ? (
            <span className="rounded border border-dashed border-border px-1.5 py-px text-[11px] text-muted-foreground">Sample listing</span>
          ) : null}
        </div>
        <Heading id={headingId} className="mt-2.5 text-[0.9375rem] leading-snug font-medium text-foreground">
          {resource.title}
        </Heading>
        <p className="mt-0.5 text-xs text-muted-foreground">{resource.provider}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{resource.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-3.5" />
              {resource.duration}
            </span>
            <DifficultyLabel difficulty={resource.difficulty} />
          </p>
          <Button variant="outline" size="sm" onClick={() => onOpen(resource)} className="shrink-0">
            View
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
            <span className="sr-only"> {resource.title}</span>
          </Button>
        </div>
      </div>
    </article>
  )
}
