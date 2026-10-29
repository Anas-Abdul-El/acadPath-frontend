import { PlanStatusIcon } from "@/components/webApp/plan/plan-status";
import {
  COURSE_CATEGORIES,
  type CourseCategory,
} from "@/mock/academic/course-catalog";
import type { PlanCourse } from "@/lib/academic/plan";
import { cn } from "@/lib/utils";

const CATEGORY_DOT: Record<CourseCategory, string> = {
  "major-requirement": "bg-primary",
  "major-elective": "bg-highlight",
  "math-science": "bg-chart-3",
  "general-education": "bg-muted-foreground/50",
};

const STATUS_LABEL: Record<PlanCourse["status"], string> = {
  completed: "Completed",
  current: "Enrolled",
  planned: "Planned",
  remaining: "Remaining",
};

export function PlanCourseTile({ course }: { course: PlanCourse }) {
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col rounded-md border bg-card p-3.5 transition-colors hover:border-primary/30",
        course.status === "remaining"
          ? "border-dashed border-muted-foreground/35"
          : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-0.5 font-mono text-[11px] text-muted-foreground">
          {course.code}
        </p>
        {course.grade ? (
          <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-sm bg-success/10 px-1.5 font-mono text-sm text-success">
            <span className="sr-only">Grade </span>
            {course.grade}
          </span>
        ) : (
          <span className="inline-flex h-6 items-center">
            <PlanStatusIcon status={course.status} />
            <span className="sr-only">{STATUS_LABEL[course.status]}</span>
          </span>
        )}
      </div>

      <p className="mt-1 text-sm leading-snug font-medium text-pretty text-foreground">
        {course.title}
      </p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4 text-[11px] text-muted-foreground">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                CATEGORY_DOT[course.category],
              )}
            />
            {COURSE_CATEGORIES[course.category].label}
          </p>
          <p className="truncate">
            {course.prerequisites.length > 0 ? (
              <>
                Requires{" "}
                <span className="font-mono">
                  {course.prerequisites.join(", ")}
                </span>
              </>
            ) : (
              "No prerequisites"
            )}
          </p>
        </div>
        <p className="shrink-0 whitespace-nowrap">
          <span className="font-mono text-sm text-foreground font-tabular">
            {course.credits}
          </span>{" "}
          cr
        </p>
      </div>
    </li>
  );
}
