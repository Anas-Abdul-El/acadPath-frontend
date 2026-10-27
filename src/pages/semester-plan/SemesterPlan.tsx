import { useState } from "react";
import { GitBranch, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { AppPageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { PlanLegend } from "@/components/webApp/plan/plan-status";
import { SemesterCard } from "@/components/webApp/plan/semester-card";
import { Button } from "@/components/ui/button";
import { catalogInfo } from "@/mock/academic/course-catalog";
import { expectedGraduation } from "@/mock/academic/semester-plan";
import { buildPlanTimeline } from "@/lib/academic/plan";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const timeline = buildPlanTimeline();
const completed = timeline.filter(
  (semester) => semester.status === "completed",
);
const upcoming = timeline.filter((semester) => semester.status !== "completed");
const plannedCredits = timeline.reduce(
  (sum, semester) => sum + semester.credits,
  0,
);
const remainingCredits = upcoming.reduce(
  (sum, semester) => sum + semester.credits,
  0,
);

type View = "upcoming" | "all";

export function SemesterPlanPage() {
  const [view, setView] = useState<View>("upcoming");
  const visible = view === "all" ? timeline : upcoming;

  return (
    <div className="space-y-6">
      <title>Semester Plan · AcadPath</title>
      <AppPageHeader
        title="Semester plan"
        description={`Your path from ${timeline[0].label} to graduation in ${expectedGraduation}, built from your academic record and the ${catalogInfo.catalogYear}.`}
        actions={
          <>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-background"
            >
              <Link to={ROUTES.app.whatIf}>
                <GitBranch data-icon="inline-start" aria-hidden="true" />
                Test a change
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to={ROUTES.app.advisor}>
                <Sparkles data-icon="inline-start" aria-hidden="true" />
                Ask about this plan
              </Link>
            </Button>
          </>
        }
      />

      <section
        aria-label="Plan summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
      >
        <StatTile
          label="Credits in plan"
          value={plannedCredits}
          unit={`/ ${catalogInfo.creditsRequired}`}
          footer="Meets degree total"
        />
        <StatTile
          label="Credits remaining"
          value={remainingCredits}
          footer="Including this semester"
        />
        <StatTile
          label="Semesters left"
          value={upcoming.length}
          footer={`${upcoming[0].label} – ${upcoming[upcoming.length - 1].label}`}
        />
        <StatTile
          label="Expected graduation"
          value={
            <span className="text-[1.75rem]">
              {expectedGraduation.replace("December", "Dec")}
            </span>
          }
          footer="If every course is passed"
        />
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PlanLegend />
        <div
          role="group"
          aria-label="Semesters to show"
          className="inline-flex self-start rounded-md border border-border bg-muted p-0.5"
        >
          {(
            [
              ["upcoming", "Upcoming"],
              ["all", `All semesters (${timeline.length})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                "rounded-[5px] px-3 py-1 text-xs whitespace-nowrap transition-colors",
                view === value
                  ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "upcoming" ? (
        <button
          type="button"
          onClick={() => setView("all")}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left text-sm transition-colors hover:bg-muted sm:px-5"
        >
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {completed.length} completed semesters
            </span>{" "}
            · {completed.reduce((sum, semester) => sum + semester.credits, 0)}{" "}
            credits ({completed[0].label} –{" "}
            {completed[completed.length - 1].label})
          </span>
          <span className="shrink-0 text-xs font-medium text-primary">
            Show
          </span>
        </button>
      ) : null}

      <ol className="relative space-y-4 sm:pl-8">
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[11px] hidden w-px bg-border sm:block"
        />
        {visible.map((semester) => (
          <li key={semester.id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-5 -left-8 hidden size-[23px] items-center justify-center rounded-full border-2 bg-background sm:flex",
                semester.status === "completed" && "border-success",
                semester.status === "current" && "border-primary",
                semester.status === "planned" && "border-highlight",
                semester.status === "remaining" &&
                  "border-dashed border-muted-foreground/50",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  semester.status === "completed" && "bg-success",
                  semester.status === "current" && "bg-primary",
                  semester.status === "planned" && "bg-highlight",
                )}
              />
            </span>
            <SemesterCard semester={semester} />
          </li>
        ))}
      </ol>
    </div>
  );
}
