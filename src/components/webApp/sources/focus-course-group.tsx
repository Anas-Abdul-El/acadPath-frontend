import { ResourceCard } from "@/components/webApp/sources/resource-card"
import type { LearningResource } from "@/mock/sources/resources"
import type { FocusCourse } from "@/lib/sources/recommendations"

type FocusCourseGroupProps = {
  focus: FocusCourse
  onOpen: (resource: LearningResource) => void
}

/** One course the student needs help with, followed by the resources recommended for it. */
export function FocusCourseGroup({ focus, onOpen }: FocusCourseGroupProps) {
  const headingId = `focus-${focus.course.code.replace(/\s+/g, "-")}`
  return (
    <section aria-labelledby={headingId} className="rounded-xl border border-border bg-card/50 p-4 sm:p-5">
      <div>
        <h4 id={headingId} className="text-base font-medium text-foreground">
          <span className="font-mono text-sm text-muted-foreground">{focus.course.code}</span> {focus.course.title}
        </h4>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{focus.why}</p>
      </div>

      {focus.resources.length ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {focus.resources.map((resource) => (
            <li key={resource.id} className="flex [&>article]:w-full">
              <ResourceCard resource={resource} courseCode={focus.course.code} onOpen={onOpen} headingLevel={5} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          No recommendations for this course yet — try searching for it below.
        </p>
      )}
    </section>
  )
}
