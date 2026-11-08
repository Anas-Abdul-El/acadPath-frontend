import { useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  CalendarRange,
  ChevronDown,
  GitBranch,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAcademicRecords } from "@/api/academics";
import { useCurrentUser } from "@/api/me";
import {
  useGeneratePlan,
  useSetPlanCourseStatus,
  useStudyPlan,
} from "@/api/study-plan";
import type { StudyPlanDto } from "@/api/types";
import { AppPageHeader } from "@/components/shared/page-header";
import { QueryError, Skeleton } from "@/components/shared/query-state";
import { StatTile } from "@/components/shared/stat-tile";
import { PlanRoadmap } from "@/components/webApp/plan/plan-roadmap";
import { PlanLegend } from "@/components/webApp/plan/plan-status";
import { PLAN_STATUS_FILL } from "@/components/webApp/plan/plan-status-fill";
import { SemesterCard } from "@/components/webApp/plan/semester-card";
import { Button } from "@/components/ui/button";
import {
  buildPlanTimeline,
  type PlanCourse,
  type PlanSemester,
} from "@/lib/academic/plan";
import { graduationLabel } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type View = "upcoming" | "all";

const sumCredits = (semesters: PlanSemester[]) =>
  semesters.reduce((sum, semester) => sum + semester.credits, 0);

export function SemesterPlanPage() {
  const records = useAcademicRecords();
  const plan = useStudyPlan();
  const generate = useGeneratePlan();

  const loading = records.isPending || plan.isPending;
  const error = records.error ?? plan.error;
  const hasPlan = Boolean(plan.data);

  const generateButton = (
    <Button
      size="lg"
      variant={hasPlan ? "outline" : "default"}
      className={hasPlan ? "bg-background" : undefined}
      disabled={generate.isPending}
      onClick={() => generate.mutate({})}
    >
      {generate.isPending ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : hasPlan ? (
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
      ) : (
        <Sparkles data-icon="inline-start" aria-hidden="true" />
      )}
      {generate.isPending
        ? "Generating your plan…"
        : hasPlan
          ? "Regenerate plan"
          : "Generate my plan"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <title>Semester Plan · AcadPath</title>
      {loading ? (
        <PlanSkeleton />
      ) : error ? (
        <>
          <AppPageHeader
            title="Semester plan"
            description="Your path to graduation."
          />
          <QueryError
            error={error}
            onRetry={() => {
              void records.refetch();
              void plan.refetch();
            }}
            title="We couldn't load your plan"
          />
        </>
      ) : (
        <PlanContent
          records={records.data ?? []}
          plan={plan.data ?? null}
          generateButton={generateButton}
        />
      )}
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading your plan">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

type PlanContentProps = {
  records: Parameters<typeof buildPlanTimeline>[0];
  plan: StudyPlanDto | null;
  generateButton: ReactNode;
};

function PlanContent({ records, plan, generateButton }: PlanContentProps) {
  const { profile } = useCurrentUser();
  const setStatus = useSetPlanCourseStatus();
  const [view, setView] = useState<View>("upcoming");

  const timeline = useMemo(
    () => buildPlanTimeline(records, plan),
    [records, plan],
  );
  const completed = timeline.filter((s) => s.status === "completed");
  const upcoming = timeline.filter((s) => s.status !== "completed");
  const visible = view === "all" ? timeline : upcoming;

  const totalCredits = sumCredits(timeline);
  const completedCredits = sumCredits(completed);
  const remainingCredits = sumCredits(upcoming);
  const creditsRequired =
    plan?.totals.creditsRequired ??
    profile?.major?.totalRequiredCredits ??
    null;
  const expected = plan?.expectedGraduation ?? null;
  const shortGraduation = expected ? graduationLabel(expected, true) : null;
  const hasCurrent = upcoming.some((s) => s.status === "current");
  const catalogYear = profile?.university?.catalogYear;
  const firstSemester = timeline.at(0);
  const firstUpcoming = upcoming.at(0);
  const lastUpcoming = upcoming.at(-1);

  const toggleSkip = (course: PlanCourse) => {
    if (!course.planCourseId) return;
    setStatus.mutate({
      planCourseId: course.planCourseId,
      status: course.skipped ? "PLANNED" : "SKIPPED",
    });
  };

  const jumpTo = (id: string) => {
    if (view === "upcoming" && !upcoming.some((s) => s.id === id)) {
      flushSync(() => setView("all"));
    }
    const target = document.getElementById(`semester-${id}`);
    target?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  };

  const description =
    firstSemester && expected
      ? `Your path from ${firstSemester.label} to graduation in ${graduationLabel(expected)}, built from your academic record${catalogYear ? ` and the ${catalogYear} catalog` : ""}.`
      : "A semester-by-semester plan through graduation, built from your academic record and your major's catalog.";

  return (
    <>
      <AppPageHeader
        title="Semester plan"
        description={description}
        actions={
          <>
            {plan ? (
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
            ) : null}
            {generateButton}
          </>
        }
      />

      {plan ? (
        <section
          aria-label="Plan summary"
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="px-4 pt-4 pb-5 sm:px-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-sm font-medium text-foreground">
                Path to graduation
              </h2>
              {firstSemester && expected ? (
                <p className="font-mono text-[11px] text-muted-foreground">
                  {firstSemester.label} → {graduationLabel(expected)}
                </p>
              ) : null}
            </div>
            <PlanRoadmap
              semesters={timeline}
              graduation={shortGraduation ?? "Graduation"}
              onSelect={jumpTo}
            />
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
            <StatTile
              label="Credits in plan"
              value={totalCredits}
              unit={
                creditsRequired !== null ? `/ ${creditsRequired}` : undefined
              }
              footer={
                plan.totals.meetsDegreeTotal === null
                  ? "Degree total not set"
                  : plan.totals.meetsDegreeTotal
                    ? "Meets degree total"
                    : "Short of the degree total"
              }
            />
            <StatTile
              label="Credits remaining"
              value={remainingCredits}
              footer={
                hasCurrent ? "Including this semester" : "Across the plan"
              }
            />
            <StatTile
              label="Semesters left"
              value={upcoming.length}
              footer={
                firstUpcoming && lastUpcoming
                  ? `${firstUpcoming.label} – ${lastUpcoming.label}`
                  : "—"
              }
            />
            <StatTile
              label="Expected graduation"
              value={
                <span className="text-[1.75rem]">{shortGraduation ?? "—"}</span>
              }
              footer="If every course is passed"
            />
          </div>
        </section>
      ) : (
        <NoPlanCallout generateButton={generateButton} />
      )}

      {plan && (plan.assumptions.length > 0 || plan.notes.length > 0) ? (
        <details className="group rounded-lg border border-border bg-card px-4 py-3 text-sm sm:px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-foreground">
            How this plan was built
            <ChevronDown
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <ul className="mt-3 space-y-1.5 text-muted-foreground">
            {[...plan.assumptions, ...plan.notes].map((line) => (
              <li key={line} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1 shrink-0 rounded-full bg-highlight"
                />
                {line}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {timeline.length > 0 ? (
        <>
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
            {view === "upcoming" && completed.length > 0 ? (
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
                      {completed.length} completed{" "}
                      {completed.length === 1 ? "semester" : "semesters"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {completed[0].label} –{" "}
                      {completed[completed.length - 1].label} ·{" "}
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
                <SemesterCard semester={semester} onToggleSkip={toggleSkip} />
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </>
  );
}

function NoPlanCallout({
  generateButton,
}: {
  generateButton: ReactNode;
}) {
  return (
    <section
      aria-labelledby="no-plan-title"
      className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-primary/30 bg-secondary/40 p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <CalendarRange aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="no-plan-title" className="font-medium text-foreground">
          You don&rsquo;t have a plan yet
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">
          AcadPath orders your remaining courses into semesters through
          graduation, checking prerequisites, the terms each course is offered,
          and credit limits. It takes a few seconds.
        </p>
      </div>
      <div className="shrink-0">{generateButton}</div>
    </section>
  );
}
