import { useId, useRef, useState, type KeyboardEvent } from "react";

import { CourseStatusLabel } from "@/components/webApp/overview/course-status";
import { DashboardCard } from "@/components/shared/dashboard-card";
import type { PreviewTerm } from "@/mock/student-preview";
import { cn } from "@/lib/utils";

type TermCoursesProps = {
  terms: PreviewTerm[];
  className?: string;
};

export function TermCourses({ terms, className }: TermCoursesProps) {
  const [activeId, setActiveId] = useState(terms[0].id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const activeIndex = terms.findIndex((term) => term.id === activeId);
  const activeTerm = terms[activeIndex];
  const totalCredits = activeTerm.courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + step + terms.length) % terms.length;
    setActiveId(terms[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <DashboardCard
      className={className}
      title="Courses"
      subtitle={`${activeTerm.label} · ${totalCredits} credits`}
      action={
        <div
          role="tablist"
          aria-label="Semester"
          className="inline-flex rounded-md border border-border bg-muted p-0.5"
        >
          {terms.map((term, index) => {
            const selected = term.id === activeId;
            return (
              <button
                key={term.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${term.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(term.id)}
                onKeyDown={onTabKeyDown}
                className={cn(
                  "rounded-[5px] px-2.5 py-1 text-xs whitespace-nowrap transition-colors",
                  selected
                    ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {term.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${activeId}`}
        className="-mx-4 sm:-mx-5"
      >
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            {activeTerm.tag} courses for {activeTerm.label}
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
                Requirement
              </th>
              <th
                scope="col"
                className="hidden px-3 py-2 text-right font-medium sm:table-cell"
              >
                Cr
              </th>
              <th scope="col" className="py-2 pr-4 pl-3 font-medium sm:pr-5">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTerm.courses.map((course) => (
              <tr
                key={course.code}
                className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/60"
              >
                <td className="py-2.5 pr-3 pl-4 sm:pl-5">
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {course.code}
                  </p>
                  <p className="text-[13px] text-foreground">{course.title}</p>
                </td>
                <td className="hidden px-3 py-2.5 text-xs text-muted-foreground md:table-cell">
                  {course.category}
                </td>
                <td className="hidden px-3 py-2.5 text-right font-mono text-xs text-foreground font-tabular sm:table-cell">
                  {course.credits}
                </td>
                <td className="py-2.5 pr-4 pl-3 sm:pr-5">
                  <CourseStatusLabel status={course.status} />
                  <p className="mt-0.5 hidden text-[11px] text-muted-foreground lg:block">
                    {course.detail}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
