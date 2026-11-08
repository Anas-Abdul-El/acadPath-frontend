import { EyeOff, RotateCcw } from "lucide-react";

import { PlanStatusIcon } from "@/components/webApp/plan/plan-status";
import type { CourseCategory } from "@/api/types";
import type { PlanCourse } from "@/lib/academic/plan";
import { categoryLabel, gradeLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

const CATEGORY_DOT: Record<CourseCategory, string> = {
  MAJOR_REQUIREMENT: "bg-primary",
  MAJOR_ELECTIVE: "bg-highlight",
  MATH_SCIENCE: "bg-chart-3",
  GENERAL_EDUCATION: "bg-muted-foreground/50",
};

const STATUS_LABEL: Record<PlanCourse["status"], string> = {
  completed: "Completed",
  current: "Enrolled",
  planned: "Planned",
  remaining: "Remaining",
};

type PlanCourseTileProps = {
  course: PlanCourse;
  /** Skips a planned course, or restores a skipped one. Only planned courses get it. */
  onToggleSkip?: (course: PlanCourse) => void;
};

export function PlanCourseTile({ course, onToggleSkip }: PlanCourseTileProps) {
  const canToggle =
    onToggleSkip &&
    course.planCourseId &&
    (course.status === "planned" || course.status === "remaining");

  return (
    <li
      className={cn(
        "group/tile flex min-w-0 flex-col rounded-md border bg-card p-3.5 transition-colors hover:border-primary/30",
        course.status === "remaining"
          ? "border-dashed border-muted-foreground/35"
          : "border-border",
        course.skipped && "border-dashed bg-muted/40 opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-0.5 font-mono text-[11px] text-muted-foreground">
          {course.code}
        </p>
        {course.grade ? (
          <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-sm bg-success/10 px-1.5 font-mono text-sm text-success">
            <span className="sr-only">Grade </span>
            {gradeLabel(course.grade)}
          </span>
        ) : course.skipped ? (
          <span className="inline-flex h-6 items-center rounded-full border border-border px-2 text-[11px] text-muted-foreground">
            Skipped
          </span>
        ) : (
          <span className="inline-flex h-6 items-center">
            <PlanStatusIcon status={course.status} />
            <span className="sr-only">{STATUS_LABEL[course.status]}</span>
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-1 text-sm leading-snug font-medium text-pretty text-foreground",
          course.skipped && "line-through decoration-muted-foreground/50",
        )}
      >
        {course.name}
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
            {categoryLabel(course.category)}
          </p>
          {course.prerequisites ? (
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
          ) : null}
        </div>
        <p className="shrink-0 whitespace-nowrap">
          <span className="font-mono text-sm text-foreground font-tabular">
            {course.credits}
          </span>{" "}
          cr
        </p>
      </div>

      {canToggle ? (
        <button
          type="button"
          onClick={() => onToggleSkip(course)}
          className="mt-3 inline-flex items-center gap-1.5 self-start rounded-sm text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary"
        >
          {course.skipped ? (
            <>
              <RotateCcw aria-hidden="true" className="size-3" />
              Restore to plan
            </>
          ) : (
            <>
              <EyeOff aria-hidden="true" className="size-3" />
              Skip this course
            </>
          )}
          <span className="sr-only"> {course.code}</span>
        </button>
      ) : null}
    </li>
  );
}
