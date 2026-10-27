import {
  ArrowRight,
  CalendarRange,
  GitBranch,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

import { AppPageHeader } from "@/components/shared/page-header";
import { AdvisorInsight } from "@/components/webApp/overview/advisor-insight";
import { DashboardCard } from "@/components/shared/dashboard-card";
import { GpaTrendChart } from "@/components/webApp/overview/gpa-trend-chart";
import { RequirementProgress } from "@/components/webApp/overview/requirement-progress";
import { StatTile } from "@/components/shared/stat-tile";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { catalogInfo } from "@/mock/academic/course-catalog";
import {
  expectedGraduation,
  generatedPlan,
} from "@/mock/academic/semester-plan";
import {
  completedTerms,
  currentTerm,
  studentProfile,
} from "@/mock/academic/student-record";
import { getCourse } from "@/lib/academic/catalog";
import {
  creditsCompleted,
  creditsRequired,
  cumulativeGpa,
  currentTermCredits,
  gpaChangeOverYear,
  graduationPercent,
  requirementGroups,
  termGpaHistory,
} from "@/lib/academic/record";
import { selectAccount } from "@/store/slices/onboarding/onboarding-slice";
import { ROUTES } from "@/lib/routes";
import { useAppSelector } from "@/store/hooks";

const termPercent = Math.round((currentTerm.week / currentTerm.weeks) * 100);
const lastTerm = completedTerms[completedTerms.length - 1];
const lastTermGpa = termGpaHistory[termGpaHistory.length - 1];

function greeting(date = new Date()) {
  const hour = date.getHours();
  return hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";
}

const quickActions = [
  {
    to: ROUTES.app.plan,
    icon: CalendarRange,
    label: "Review your semester plan",
    detail: "Through " + expectedGraduation,
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

export function OverviewPage() {
  const account = useAppSelector(selectAccount);
  const firstName = account?.name.split(/\s+/)[0] ?? studentProfile.firstName;
  const gpaUp = gpaChangeOverYear >= 0;

  return (
    <div className="space-y-6">
      <title>Overview · AcadPath</title>
      <AppPageHeader
        title={`${greeting()}, ${firstName}`}
        description={`${currentTerm.label} · Week ${currentTerm.week} of ${currentTerm.weeks} · ${studentProfile.program}`}
        actions={
          <p className="font-mono text-xs text-muted-foreground">
            Expected graduation ·{" "}
            <span className="text-foreground">{expectedGraduation}</span>
          </p>
        }
      />

      <section
        aria-label="Academic summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
      >
        <StatTile
          label="Cumulative GPA"
          value={cumulativeGpa.toFixed(2)}
          footer={
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
              {gpaChangeOverYear.toFixed(2)} since last year
            </span>
          }
        />
        <StatTile
          label="Credits completed"
          value={creditsCompleted}
          unit={`/ ${creditsRequired}`}
          footer={`${creditsRequired - creditsCompleted} credits remaining`}
        />
        <StatTile
          label="Current semester"
          value={<span className="text-[1.75rem]">{currentTerm.label}</span>}
          footer={
            <div className="space-y-1.5">
              <span>{currentTermCredits} credits enrolled</span>
              <Progress
                value={termPercent}
                aria-label={`Week ${currentTerm.week} of ${currentTerm.weeks}`}
                className="h-1 bg-secondary"
              />
            </div>
          }
        />
        <StatTile
          label="Graduation progress"
          value={graduationPercent}
          unit="%"
          footer={
            <div className="space-y-1.5">
              <span>On track for {expectedGraduation}</span>
              <Progress
                value={graduationPercent}
                aria-label={`${graduationPercent}% of degree credits completed`}
                className="h-1 bg-secondary [&>[data-slot=progress-indicator]]:bg-highlight"
              />
            </div>
          }
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GpaTrendChart data={termGpaHistory} className="lg:col-span-2" />
        <RequirementProgress
          groups={requirementGroups}
          catalogYear={catalogInfo.catalogYear}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdvisorInsight
          className="md:col-span-2 lg:col-span-1"
          title="Stay on track for December 2027"
          body={
            generatedPlan.notes[0] +
            " Taking CS 3410 in Spring 2027 keeps that door open."
          }
          footnote={`Based on catalog rules · ${catalogInfo.catalogYear}`}
          action={
            <Button asChild variant="inverse" size="lg">
              <Link to={ROUTES.app.advisor}>
                Ask a follow-up
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        />

        <DashboardCard
          title="Last semester"
          subtitle={`${lastTerm.label} · ${lastTermGpa.credits} credits`}
          action={
            <p className="text-right text-xs text-muted-foreground">
              Term GPA
              <span className="ml-1.5 font-mono text-sm text-foreground font-tabular">
                {lastTermGpa.gpa.toFixed(2)}
              </span>
            </p>
          }
        >
          <ul className="-my-1 divide-y divide-border/70">
            {lastTerm.courses.map(({ code, grade }) => (
              <li
                key={code}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {code}
                  </p>
                  <p className="truncate text-[13px] text-foreground">
                    {getCourse(code).title}
                  </p>
                </div>
                <span className="w-8 text-right font-mono text-sm text-foreground">
                  {grade}
                </span>
              </li>
            ))}
          </ul>
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
    </div>
  );
}
