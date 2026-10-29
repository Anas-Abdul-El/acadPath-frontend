import { useState } from "react";
import { flushSync } from "react-dom";
import { ChevronDown, GitBranch, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { AppPageHeader } from "@/components/shared/page-header";
import { StatTile } from "@/components/shared/stat-tile";
import { PlanRoadmap } from "@/components/webApp/plan/plan-roadmap";
import { PlanLegend } from "@/components/webApp/plan/plan-status";
import { PLAN_STATUS_FILL } from "@/components/webApp/plan/plan-status-fill";
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
const completedCredits = completed.reduce(
  (sum, semester) => sum + semester.credits,
  0,
);
const shortGraduation = expectedGraduation.replace("December", "Dec");

type View = "upcoming" | "all";

export function SemesterPlanPage() {
  const [view, setView] = useState<View>("upcoming");
  const visible = view === "all" ? timeline : upcoming;

  const jumpTo = (id: string) => {
    if (view === "upcoming" && !upcoming.some((s) => s.id === id)) {
      flushSync(() => setView("all"));
    }
    const target = document.getElementById(`semester-${id}`);
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  };

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
        className="overflow-hidden rounded-lg border border-border bg-card"
      >
        <div className="px-4 pt-4 pb-5 sm:px-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-sm font-medium text-foreground">
              Path to graduation
            </h2>
            <p className="font-mono text-[11px] text-muted-foreground">
              {timeline[0].label} → {expectedGraduation}
            </p>
          </div>
          <PlanRoadmap
            semesters={timeline}
            graduation={shortGraduation}
            onSelect={jumpTo}
          />
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
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
            value={<span className="text-[1.75rem]">{shortGraduation}</span>}
            footer="If every course is passed"
          />
        </div>
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

      <ol className="relative space-y-10 sm:pl-8">
        <span
          aria-hidden="true"
          className="absolute top-5 bottom-5 left-2 hidden w-px bg-border sm:block"
        />
        {view === "upcoming" ? (
          <li className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 -left-[29px] hidden size-[11px] -translate-y-1/2 rounded-full ring-4 ring-background sm:block",
                PLAN_STATUS_FILL.completed,
              )}
            />
            <button
              type="button"
              onClick={() => setView("all")}
              className="group flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/30 hover:bg-muted/40 sm:px-5"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">
                  {completed.length} completed semesters
                </span>
                <span className="block text-xs text-muted-foreground">
                  {completed[0].label} – {completed[completed.length - 1].label}{" "}
                  ·{" "}
                  <span className="font-mono text-foreground font-tabular">
                    {completedCredits}
                  </span>{" "}
                  credits
                </span>
              </span>
              <span
                aria-hidden="true"
                className="hidden items-end gap-1 sm:flex"
              >
                {completed.map((semester) => (
                  <span
                    key={semester.id}
                    style={{ height: `${semester.credits * 1.25}px` }}
                    className="w-1.5 rounded-full bg-success/70"
                  />
                ))}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                Show
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-y-0.5"
                />
              </span>
            </button>
          </li>
        ) : null}
        {visible.map((semester) => (
          <li key={semester.id}>
            <SemesterCard semester={semester} />
          </li>
        ))}
      </ol>
    </div>
  );
}
