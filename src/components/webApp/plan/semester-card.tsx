import { Sparkles } from "lucide-react";

import { PlanCourseTile } from "@/components/webApp/plan/plan-course-tile";
import { PLAN_STATUS_FILL } from "@/components/webApp/plan/plan-status-fill";
import type { PlanSemester } from "@/lib/academic/plan";
import { cn } from "@/lib/utils";

const CONTAINER: Record<PlanSemester["status"], string> = {
  completed: "border-border bg-muted/30",
  current: "border-primary/40 bg-muted/30 ring-3 ring-primary/10",
  planned: "border-highlight/70 bg-highlight/4",
  remaining: "border-dashed border-muted-foreground/35 bg-transparent",
};

/** One semester on the plan timeline: a term rail on the left, its courses on the right. */
export function SemesterCard({ semester }: { semester: PlanSemester }) {
  const headingId = `semester-${semester.id}-title`;
  const [season, year = ""] = semester.label.split(" ");

  return (
    <section
      id={`semester-${semester.id}`}
      tabIndex={-1}
      aria-labelledby={headingId}
      className="relative grid gap-3 outline-none lg:grid-cols-[8.5rem_minmax(0,1fr)] lg:gap-6"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-4.5 -left-7.25 hidden size-2.75 rounded-full ring-4 ring-background sm:block",
          PLAN_STATUS_FILL[semester.status],
        )}
      />

      <div className="flex items-end justify-between gap-3 lg:flex-col lg:items-start lg:justify-start lg:pt-2">
        <h3 id={headingId}>
          <span className="block font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            {season}
          </span>
          <span className="block font-display text-3xl leading-none tracking-tight text-foreground font-tabular">
            {year}
          </span>
        </h3>
        <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-mono text-foreground font-tabular">
              {semester.credits}
            </span>{" "}
            credits · {semester.courses.length} courses
          </p>
        </div>
      </div>

      <div
        className={cn(
          "min-w-0 rounded-lg border p-3 sm:p-4",
          CONTAINER[semester.status],
        )}
      >
        {semester.rationale ? (
          <div className="mb-3 flex gap-2.5 rounded-md bg-card px-3 py-2.5 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border">
            <Sparkles
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-primary"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                Why this semester.
              </span>{" "}
              {semester.rationale}
            </p>
          </div>
        ) : null}

        <ul
          aria-label={`${semester.label} courses`}
          className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
        >
          {semester.courses.map((course) => (
            <PlanCourseTile key={course.code} course={course} />
          ))}
        </ul>
      </div>
    </section>
  );
}
