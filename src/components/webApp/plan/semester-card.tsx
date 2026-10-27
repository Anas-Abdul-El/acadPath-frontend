import {
  PlanStatusIcon,
  PlanStatusPill,
} from "@/components/webApp/plan/plan-status";
import { COURSE_CATEGORIES } from "@/mock/academic/course-catalog";
import type { PlanSemester } from "@/lib/academic/plan";
import { cn } from "@/lib/utils";

const CONTAINER: Record<PlanSemester["status"], string> = {
  completed: "border-border bg-card",
  current: "border-primary/40 bg-card ring-3 ring-primary/10",
  planned: "border-highlight/70 bg-card",
  remaining: "border-dashed border-muted-foreground/35 bg-card/60",
};

export function SemesterCard({ semester }: { semester: PlanSemester }) {
  const headingId = `semester-${semester.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border",
        CONTAINER[semester.status],
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3
              id={headingId}
              className="font-display text-xl tracking-tight text-foreground"
            >
              {semester.label}
            </h3>
            <PlanStatusPill status={semester.status} />
          </div>
          {semester.rationale ? (
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground">
              {semester.rationale}
            </p>
          ) : null}
        </div>
        <p className="text-right text-xs text-muted-foreground">
          <span className="font-mono text-lg text-foreground font-tabular">
            {semester.credits}
          </span>{" "}
          credits
        </p>
      </div>

      <table className="mt-3 w-full text-left text-sm">
        <caption className="sr-only">
          {semester.label} courses, {semester.credits} credits
        </caption>
        <thead>
          <tr className="border-y border-border text-[11px] tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="py-2 pr-3 pl-4 font-medium sm:pl-5">
              Course
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2 font-medium md:table-cell"
            >
              Prerequisites
            </th>
            <th
              scope="col"
              className="hidden px-3 py-2 font-medium lg:table-cell"
            >
              Requirement
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Cr
            </th>
            <th
              scope="col"
              className="py-2 pr-4 pl-3 text-right font-medium sm:pr-5"
            >
              {semester.status === "completed" ? "Grade" : "Status"}
            </th>
          </tr>
        </thead>
        <tbody>
          {semester.courses.map((course) => (
            <tr
              key={course.code}
              className="border-b border-border/70 last:border-b-0"
            >
              <td className="py-2.5 pr-3 pl-4 sm:pl-5">
                <div className="flex items-start gap-2.5">
                  <PlanStatusIcon status={course.status} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {course.code}
                    </p>
                    <p className="text-[13px] text-foreground">
                      {course.title}
                    </p>
                    {course.prerequisites.length > 0 ? (
                      <p className="mt-0.5 text-[11px] text-muted-foreground md:hidden">
                        Requires {course.prerequisites.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="hidden px-3 py-2.5 font-mono text-[11px] text-muted-foreground md:table-cell">
                {course.prerequisites.length > 0
                  ? course.prerequisites.join(", ")
                  : "—"}
              </td>
              <td className="hidden px-3 py-2.5 text-xs text-muted-foreground lg:table-cell">
                {COURSE_CATEGORIES[course.category].label}
              </td>
              <td className="px-3 py-2.5 text-right font-mono text-xs text-foreground font-tabular">
                {course.credits}
              </td>
              <td className="py-2.5 pr-4 pl-3 text-right sm:pr-5">
                {course.grade ? (
                  <span className="font-mono text-sm text-foreground">
                    {course.grade}
                  </span>
                ) : (
                  <span className="sr-only sm:not-sr-only sm:text-xs sm:text-muted-foreground">
                    {course.status === "current"
                      ? "Enrolled"
                      : course.status === "planned"
                        ? "Planned"
                        : "Remaining"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
