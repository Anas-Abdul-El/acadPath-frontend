import { CalendarDays, CircleCheck, CircleX } from "lucide-react"

import type { CourseCategory, MyCourseDto, RequisiteDto } from "@/api/types"
import { categoryLabel, gradeLabel, offeredLabel, termLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"

const CATEGORY_STYLE: Record<CourseCategory, string> = {
  MAJOR_REQUIREMENT: "bg-primary/10 text-primary",
  MAJOR_ELECTIVE: "bg-highlight/20 text-highlight-foreground",
  MATH_SCIENCE: "bg-chart-3/15 text-[color-mix(in_oklch,var(--chart-3),var(--foreground)_45%)]",
  GENERAL_EDUCATION: "bg-secondary text-secondary-foreground",
}

function statusText({ status, statusDetail }: MyCourseDto) {
  const grade = statusDetail.grade ? ` · ${gradeLabel(statusDetail.grade)}` : ""
  const term =
    statusDetail.term && statusDetail.year ? termLabel({ term: statusDetail.term, year: statusDetail.year }) : null
  switch (status) {
    case "COMPLETED":
      return `Completed${grade}`
    case "FAILED":
      return `Failed${grade}`
    case "IN_PROGRESS":
      return "In progress"
    case "PLANNED":
      return term ? `Planned · ${term}` : "Planned"
    default:
      return null
  }
}

type CourseCardProps = {
  course: MyCourseDto
  /** Clicking a prerequisite chip searches for that course. */
  onSelectCode: (code: string) => void
}

export function CourseCard({ course, onSelectCode }: CourseCardProps) {
  const label = statusText(course)
  const headingId = `course-${course.id}`

  return (
    <article aria-labelledby={headingId} className="flex flex-col rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">{course.code}</p>
          <h3 id={headingId} className="mt-0.5 text-[0.9375rem] font-medium text-foreground">
            {course.name}
          </h3>
        </div>
        <p className="shrink-0 text-right text-xs text-muted-foreground">
          <span className="font-mono text-base text-foreground font-tabular">{course.credits}</span> cr
        </p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", CATEGORY_STYLE[course.category])}>
          {categoryLabel(course.category)}
        </span>
        {label ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
              course.status === "COMPLETED"
                ? "border-success/30 text-success"
                : course.status === "FAILED"
                  ? "border-destructive/30 text-destructive"
                  : "border-border text-muted-foreground",
            )}
          >
            {course.status === "COMPLETED" ? <CircleCheck aria-hidden="true" className="size-3" /> : null}
            {course.status === "FAILED" ? <CircleX aria-hidden="true" className="size-3" /> : null}
            {label}
          </span>
        ) : null}
      </div>

      {course.description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
      ) : null}

      <dl className="mt-auto space-y-1.5 pt-4 text-xs">
        <Requisites
          label="Prerequisites"
          requisites={course.prerequisites}
          metText="completed"
          onSelectCode={onSelectCode}
        />
        {course.corequisites.length > 0 ? (
          <Requisites
            label="Corequisites"
            requisites={course.corequisites}
            metText="taken or in progress"
            onSelectCode={onSelectCode}
          />
        ) : null}
        <div className="flex items-center gap-2 text-muted-foreground">
          <dt className="sr-only">Offered</dt>
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <dd>
            {course.offeredTerms.length > 0 ? `Offered ${offeredLabel(course.offeredTerms)}` : "Offering terms not listed"}
          </dd>
        </div>
      </dl>
    </article>
  )
}

function Requisites({
  label,
  requisites,
  metText,
  onSelectCode,
}: {
  label: string
  requisites: RequisiteDto[]
  metText: string
  onSelectCode: (code: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex flex-wrap gap-1.5">
        {requisites.length === 0 ? (
          <span className="text-muted-foreground">None</span>
        ) : (
          requisites.map(({ id, code, name, met }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCode(code)}
              title={`${code} ${name} — ${met ? metText : `not ${metText} yet`}`}
              className={cn(
                "inline-flex items-center gap-1 rounded border px-1.5 py-px font-mono text-[11px] transition-colors hover:border-primary/50 hover:text-primary",
                met ? "border-border text-foreground" : "border-dashed border-warning/50 text-warning",
              )}
            >
              {met ? <CircleCheck aria-hidden="true" className="size-3 text-success" /> : null}
              {code}
              <span className="sr-only">{met ? ` (${metText})` : ` (not ${metText})`}, show this course</span>
            </button>
          ))
        )}
      </dd>
    </div>
  )
}
