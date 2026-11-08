import { useMemo } from "react";
import {
  ArrowRight,
  CalendarRange,
  GitBranch,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAcademicSummary } from "@/api/academics";
import { useCurrentUser } from "@/api/me";
import { useStudyPlan } from "@/api/study-plan";
import type { AcademicSummaryDto, StudyPlanDto } from "@/api/types";
import { AppPageHeader } from "@/components/shared/page-header";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { QueryError, Skeleton } from "@/components/shared/query-state";
import { StatTile } from "@/components/shared/stat-tile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdvisorInsight } from "@/components/webApp/overview/advisor-insight";
import { GpaTrendChart } from "@/components/webApp/overview/gpa-trend-chart";
import { RequirementProgress } from "@/components/webApp/overview/requirement-progress";
import {
  categoryLabel,
  CATEGORY_ORDER,
  formatGpa,
  gradeLabel,
  graduationLabel,
  majorLabel,
  termLabel,
  termShort,
} from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import type { RequirementGroup, TermGpa } from "@/types/academic";

function greeting(date = new Date()) {
  const hour = date.getHours();
  return hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";
}

function toTermGpa(history: AcademicSummaryDto["termHistory"]): TermGpa[] {
  return history.flatMap((entry) =>
    entry.gpa === null
      ? []
      : [
          {
            term: termLabel(entry),
            shortTerm: termShort(entry),
            gpa: entry.gpa,
            credits: entry.credits,
          },
        ],
  );
}

function toRequirementGroups(
  requirements: AcademicSummaryDto["requirements"],
): RequirementGroup[] {
  return [...requirements]
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
    )
    .map((requirement) => ({
      name: categoryLabel(requirement.category),
      completed: requirement.completedCredits,
      required: requirement.plannedCredits,
    }));
}

export function OverviewPage() {
  const { user, profile } = useCurrentUser();
  const summary = useAcademicSummary();
  const plan = useStudyPlan();
  const firstName = user.name.split(/\s+/)[0];

  return (
    <div className="space-y-6">
      <title>Overview · AcadPath</title>
      {summary.data ? (
        <OverviewContent
          firstName={firstName}
          summary={summary.data}
          plan={plan.data ?? null}
          catalogYear={profile?.university?.catalogYear ?? null}
        />
      ) : summary.error ? (
        <>
          <AppPageHeader
            title={`${greeting()}, ${firstName}`}
            description="Your academic summary"
          />
          <QueryError
            error={summary.error}
            onRetry={() => summary.refetch()}
            title="We couldn't load your academic summary"
          />
        </>
      ) : (
        <OverviewSkeleton />
      )}
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading your overview">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg lg:col-span-2" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}

type OverviewContentProps = {
  firstName: string;
  summary: AcademicSummaryDto;
  plan: StudyPlanDto | null;
  catalogYear: string | null;
};

function OverviewContent({
  firstName,
  summary,
  plan,
  catalogYear,
}: OverviewContentProps) {
  const { gpa, credits, graduation, currentTerm, lastTerm } = summary;
  const termGpa = useMemo(
    () => toTermGpa(summary.termHistory),
    [summary.termHistory],
  );
  const requirementGroups = useMemo(
    () => toRequirementGroups(summary.requirements),
    [summary.requirements],
  );

  const expected = graduation.expected
    ? graduationLabel(graduation.expected)
    : null;
  const gpaChange = gpa.changeSinceLastYear;
  const gpaUp = (gpaChange ?? 0) >= 0;
  const lastTermCredits = lastTerm
    ? (summary.termHistory.find(
        (entry) => entry.term === lastTerm.term && entry.year === lastTerm.year,
      )?.credits ??
      lastTerm.courses.reduce((sum, { course }) => sum + course.credits, 0))
    : 0;

  const quickActions = [
    {
      to: ROUTES.app.plan,
      icon: CalendarRange,
      label: plan ? "Review your semester plan" : "Generate your semester plan",
      detail: expected
        ? `Through ${expected}`
        : "Every semester through graduation",
    },
    {
      to: ROUTES.app.whatIf,
      icon: GitBranch,
      label: "Test a what-if scenario",
      detail: "GPA, credits, and timeline",
    },
    {
      to: ROUTES.app.advisor,
      icon: Sparkles,
      label: "Ask the AI Advisor",
      detail: "Courses, GPA, prerequisites",
    },
  ];

  const description = [
    currentTerm ? termLabel(currentTerm) : null,
    majorLabel(summary.student.major),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <AppPageHeader
        title={`${greeting()}, ${firstName}`}
        description={description}
        actions={
          <p className="font-mono text-xs text-muted-foreground">
            Expected graduation ·{" "}
            <span className="text-foreground">
              {expected ?? "Not planned yet"}
            </span>
          </p>
        }
      />

      <section
        aria-label="Academic summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
      >
        <StatTile
          label="Cumulative GPA"
          value={formatGpa(gpa.cumulative)}
          footer={
            gpaChange === null ? (
              gpa.cumulative === null ? (
                "No graded courses yet"
              ) : (
                "Not enough history to compare"
              )
            ) : (
              <span className="inline-flex items-center gap-1">
                <TrendingUp
                  aria-hidden="true"
                  className={
                    gpaUp
                      ? "size-3.5 text-success"
                      : "size-3.5 rotate-180 text-destructive"
                  }
                />
                {gpaUp ? "+" : ""}
                {gpaChange.toFixed(2)} since last year
              </span>
            )
          }
        />
        <StatTile
          label="Credits completed"
          value={credits.completed}
          unit={credits.required !== null ? `/ ${credits.required}` : undefined}
          footer={
            credits.remaining !== null
              ? `${credits.remaining} credits remaining`
              : `${credits.inProgress} credits in progress`
          }
        />
        <StatTile
          label="Current semester"
          value={
            <span className="text-[1.75rem]">
              {currentTerm ? termLabel(currentTerm) : "—"}
            </span>
          }
          footer={
            currentTerm
              ? `${currentTerm.credits} credits enrolled`
              : "No courses in progress"
          }
        />
        <StatTile
          label="Graduation progress"
          value={graduation.progressPercent ?? "—"}
          unit={graduation.progressPercent !== null ? "%" : undefined}
          footer={
            <div className="space-y-1.5">
              <span>
                {expected
                  ? `On track for ${expected}`
                  : "Generate a plan to estimate"}
              </span>
              {graduation.progressPercent !== null ? (
                <Progress
                  value={graduation.progressPercent}
                  aria-label={`${graduation.progressPercent}% of degree credits completed`}
                  className="h-1 bg-secondary [&>[data-slot=progress-indicator]]:bg-highlight"
                />
              ) : null}
            </div>
          }
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GpaTrendChart data={termGpa} className="lg:col-span-2" />
        <RequirementProgress
          groups={requirementGroups}
          catalogYear={catalogYear ? `${catalogYear} catalog` : null}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plan ? (
          <AdvisorInsight
            className="md:col-span-2 lg:col-span-1"
            title={
              plan.expectedGraduation
                ? `Stay on track for ${graduationLabel(plan.expectedGraduation)}`
                : "Your plan through graduation"
            }
            body={
              plan.notes[0] ??
              plan.assumptions[0] ??
              "Your plan is checked against prerequisites, offered terms, and credit limits."
            }
            footnote={`From your study plan · ${new Date(plan.generatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`}
            action={
              <Button asChild variant="inverse" size="lg">
                <Link to={ROUTES.app.advisor}>
                  Ask a follow-up
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            }
          />
        ) : (
          <AdvisorInsight
            className="md:col-span-2 lg:col-span-1"
            title="Map out every semester to graduation"
            body="Generate a study plan and AcadPath will order your remaining courses around prerequisites, offered terms, and credit limits."
            footnote="Takes a few seconds"
            action={
              <Button asChild variant="inverse" size="lg">
                <Link to={ROUTES.app.plan}>
                  Generate my plan
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            }
          />
        )}

        <DashboardCard
          title="Last semester"
          subtitle={
            lastTerm
              ? `${termLabel(lastTerm)} · ${lastTermCredits} credits`
              : "No completed semesters yet"
          }
          action={
            lastTerm ? (
              <p className="text-right text-xs text-muted-foreground">
                Term GPA
                <span className="ml-1.5 font-mono text-sm text-foreground font-tabular">
                  {formatGpa(lastTerm.gpa)}
                </span>
              </p>
            ) : null
          }
        >
          {lastTerm ? (
            <ul className="-my-1 divide-y divide-border/70">
              {lastTerm.courses.map(({ course, grade, status }) => (
                <li
                  key={course.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {course.code}
                    </p>
                    <p className="truncate text-[13px] text-foreground">
                      {course.name}
                    </p>
                  </div>
                  <span
                    className={
                      status === "FAILED"
                        ? "w-8 text-right font-mono text-sm text-destructive"
                        : "w-8 text-right font-mono text-sm text-foreground"
                    }
                  >
                    {grade ? gradeLabel(grade) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Grades from your most recent semester show up here.
            </p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Next steps"
          subtitle="Plan ahead before registration opens"
        >
          <ul className="space-y-2">
            {quickActions.map(({ to, icon: Icon, label, detail }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/60"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-foreground">
                      {label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {detail}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </>
  );
}
