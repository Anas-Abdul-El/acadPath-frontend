import { CalendarDays, CircleCheck } from "lucide-react"

import { COURSE_CATEGORIES, type CatalogCourse, type CourseCategory } from "@/mock/academic/course-catalog"
import { courseStatus, type StudentCourseStatus } from "@/lib/academic/record"
import { cn } from "@/lib/utils"

const CATEGORY_STYLE: Record<CourseCategory, string> = {
  "major-requirement": "bg-primary/10 text-primary",
  "major-elective": "bg-highlight/20 text-highlight-foreground",
  "math-science": "bg-chart-3/15 text-[color-mix(in_oklch,var(--chart-3),var(--foreground)_45%)]",
  "general-education": "bg-secondary text-secondary-foreground",
}

function statusText(status: StudentCourseStatus) {
  switch (status.kind) {
    case "completed":
      return `Completed · ${status.grade}`
    case "in-progress":
      return "In progress"
    case "planned":
      return `Planned · ${status.term}`
    default:
      return null
  }
}

type CourseCardProps = {
  course: CatalogCourse
  /** Clicking a prerequisite chip searches for that course. */
  onSelectCode: (code: string) => void
}

export function CourseCard({ course, onSelectCode }: CourseCardProps) {
  const status = courseStatus(course.code)
  const label = statusText(status)

  return (
    <article
      aria-labelledby={`course-${course.code}`}
      className="flex flex-col rounded-lg border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{course.code}</p>
          <h3 id={`course-${course.code}`} className="mt-0.5 text-[0.9375rem] font-medium text-foreground">
            {course.title}
          </h3>
        </div>
        <p className="shrink-0 text-right text-xs text-muted-foreground">
          <span className="font-mono text-base text-foreground font-tabular">{course.credits}</span> cr
        </p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", CATEGORY_STYLE[course.category])}>
          {COURSE_CATEGORIES[course.category].label}
        </span>
        {label ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
              status.kind === "completed" ? "border-success/30 text-success" : "border-border text-muted-foreground",
            )}
          >
            {status.kind === "completed" ? <CircleCheck aria-hidden="true" className="size-3" /> : null}
            {label}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{course.description}</p>

      <dl className="mt-auto space-y-1.5 pt-4 text-xs">
        <Requisites label="Prerequisites" codes={course.prerequisites} onSelectCode={onSelectCode} />
        {course.corequisites.length > 0 ? (
          <Requisites label="Corequisites" codes={course.corequisites} onSelectCode={onSelectCode} />
        ) : null}
        <div className="flex items-center gap-2 text-muted-foreground">
          <dt className="sr-only">Offered</dt>
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <dd>Offered {course.offered.join(", ")}</dd>
        </div>
      </dl>
    </article>
  )
}

function Requisites({ label, codes, onSelectCode }: { label: string; codes: string[]; onSelectCode: (code: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap gap-1.5">
        {codes.length === 0 ? (
          <span className="text-muted-foreground">None</span>
        ) : (
          codes.map((code) => {
            const met = courseStatus(code).kind === "completed"
            return (
              <button
                key={code}
                type="button"
                onClick={() => onSelectCode(code)}
                title={met ? `${code} completed` : `${code} not completed yet`}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-1.5 py-px font-mono text-[11px] transition-colors hover:border-primary/50 hover:text-primary",
                  met ? "border-border text-foreground" : "border-dashed border-warning/50 text-warning",
                )}
              >
                {met ? <CircleCheck aria-hidden="true" className="size-3 text-success" /> : null}
                {code}
                <span className="sr-only">{met ? " (completed)" : " (not completed)"}, show this course</span>
              </button>
            )
          })
        )}
      </dd>
    </div>
  )
}
