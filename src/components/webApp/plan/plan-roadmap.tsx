import { GraduationCap } from "lucide-react";

import { PLAN_STATUS_FILL } from "@/components/webApp/plan/plan-status-fill";
import type { PlanSemester } from "@/lib/academic/plan";
import { cn } from "@/lib/utils";

type PlanRoadmapProps = {
  semesters: PlanSemester[];
  /** Short graduation label, e.g. "Dec 2027". */
  graduation: string;
  onSelect: (id: string) => void;
};

const STATUS_TEXT: Record<PlanSemester["status"], string> = {
  completed: "completed",
  current: "in progress",
  planned: "planned",
  remaining: "remaining",
};

function splitLabel(label: string) {
  const [season, year = ""] = label.split(" ");
  return { season, year };
}

/** Every semester as a segment sized by its credits, ending at graduation. */
export function PlanRoadmap({
  semesters,
  graduation,
  onSelect,
}: PlanRoadmapProps) {
  const grad = splitLabel(graduation);

  return (
    <nav aria-label="Jump to a semester" className="flex items-stretch gap-1">
      {semesters.map((semester) => {
        const { season, year } = splitLabel(semester.label);
        const isCurrent = semester.status === "current";
        return (
          <button
            key={semester.id}
            type="button"
            onClick={() => onSelect(semester.id)}
            aria-label={`${semester.label}, ${STATUS_TEXT[semester.status]}, ${semester.credits} credits`}
            style={{ flexGrow: semester.credits }}
            className="group flex min-w-0 basis-0 flex-col gap-2 rounded-sm text-left"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-4 font-mono text-[10px] leading-4 tracking-wide text-primary uppercase",
                !isCurrent && "invisible",
              )}
            >
              Now
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "h-2.5 rounded-full transition-opacity group-hover:opacity-70",
                PLAN_STATUS_FILL[semester.status],
                isCurrent && "ring-3 ring-primary/15",
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                "text-[11px] leading-tight text-muted-foreground transition-colors group-hover:text-foreground",
                isCurrent && "text-foreground",
              )}
            >
              <span className="block truncate">
                <span className="sm:hidden">{season.charAt(0)}</span>
                <span className="hidden sm:inline">{season}</span>
              </span>
              <span className="block truncate font-mono font-tabular">
                <span className="sm:hidden">’{year.slice(2)}</span>
                <span className="hidden sm:inline">{year}</span>
              </span>
            </span>
          </button>
        );
      })}

      <div className="ml-1 flex shrink-0 flex-col items-center gap-2 sm:ml-2">
        <span aria-hidden="true" className="h-4" />
        <span className="-my-1.75 flex size-6 items-center justify-center rounded-full border border-highlight bg-highlight/20 text-highlight-foreground">
          <GraduationCap aria-hidden="true" className="size-3.5" />
        </span>
        <span className="text-center text-[11px] leading-tight text-foreground">
          <span className="block">{grad.season}</span>
          <span className="block font-mono font-tabular">
            <span className="sm:hidden">’{grad.year.slice(2)}</span>
            <span className="hidden sm:inline">{grad.year}</span>
          </span>
        </span>
      </div>
    </nav>
  );
}
