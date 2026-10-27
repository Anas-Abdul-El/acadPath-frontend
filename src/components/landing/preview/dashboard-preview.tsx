import {
  BookOpen,
  CalendarRange,
  GitBranch,
  LayoutDashboard,
  LibraryBig,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AdvisorInsight } from "@/components/webApp/overview/advisor-insight";
import { GpaTrendChart } from "@/components/webApp/overview/gpa-trend-chart";
import { RequirementProgress } from "@/components/webApp/overview/requirement-progress";
import { StatTile } from "@/components/shared/stat-tile";
import { TermCourses } from "@/components/webApp/overview/term-courses";
import { LogoMark } from "@/components/shared/logo";
import {
  advisorInsight,
  previewTerms,
  requirementGroups,
  student,
  termGpaHistory,
} from "@/mock/student-preview";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Semester Plan", icon: CalendarRange },
  { label: "What-If", icon: GitBranch },
  { label: "Courses", icon: BookOpen },
  { label: "Resources", icon: LibraryBig },
  { label: "AI Advisor", icon: Sparkles },
];

const graduationPercent = Math.round(
  (student.creditsCompleted / student.creditsRequired) * 100,
);

function PreviewSidebar() {
  return (
    <div className="hidden w-52 shrink-0 flex-col border-r border-border bg-muted/50 p-3 lg:flex">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <LogoMark className="size-6" />
        <span className="text-sm font-semibold tracking-tight">AcadPath</span>
      </div>
      <ul className="mt-5 space-y-0.5" aria-label="App sections (preview)">
        {sidebarItems.map(({ label, icon: Icon, active }) => (
          <li
            key={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]",
              active
                ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05)]"
                : "text-muted-foreground",
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn("size-4", active && "text-primary")}
            />
            {label}
          </li>
        ))}
      </ul>
      <div className="mt-auto rounded-md border border-border bg-card p-3">
        <p className="text-xs font-medium text-foreground">{student.program}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {student.university} · {student.year}
        </p>
      </div>
    </div>
  );
}

function PreviewTopBar() {
  return (
    <div className="flex h-12 items-center justify-between gap-4 border-b border-border px-4 sm:px-5">
      <p className="truncate text-xs text-muted-foreground">
        <span className="hidden sm:inline">{student.university} / </span>
        <span className="text-foreground">Overview</span>
      </p>
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-full bg-secondary text-[11px] font-medium text-secondary-foreground"
        >
          {student.initials}
        </span>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <figure>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-x-2 -top-2 -bottom-2 rounded-2xl border border-border/80 bg-card/40 sm:-inset-x-3 sm:-top-3"
        />
        <div
          role="region"
          aria-label="AcadPath dashboard preview with sample student data"
          className="relative flex overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_60px_-24px_rgb(20_35_70/0.22)]"
        >
          <PreviewSidebar />

          <div className="min-w-0 flex-1">
            <PreviewTopBar />

            <div className="space-y-4 p-4 sm:p-5 lg:p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-display text-2xl tracking-tight text-foreground">
                    Good afternoon, {student.firstName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {student.currentTerm} · Week {student.currentWeek} of{" "}
                    {student.weeksInTerm}
                  </p>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground">
                  Expected graduation ·{" "}
                  <span className="text-foreground">
                    {student.expectedGraduation}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
                <StatTile
                  label="Cumulative GPA"
                  value={student.cumulativeGpa.toFixed(2)}
                  footer={
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp
                        aria-hidden="true"
                        className="size-3.5 text-success"
                      />
                      +{student.gpaChange.toFixed(2)} since last year
                    </span>
                  }
                />
                <StatTile
                  label="Credits completed"
                  value={student.creditsCompleted}
                  unit={`/ ${student.creditsRequired}`}
                  footer={`${student.creditsRequired - student.creditsCompleted} credits remaining`}
                />
                <StatTile
                  label="Current semester"
                  value={
                    <span className="text-[1.75rem]">
                      {student.currentTerm}
                    </span>
                  }
                  footer={
                    <div className="space-y-1.5">
                      <span>{student.currentTermCredits} credits enrolled</span>
                    </div>
                  }
                />
                <StatTile
                  label="Graduation progress"
                  value={graduationPercent}
                  unit="%"
                  footer={
                    <div className="space-y-1.5">
                      <span>On track for {student.expectedGraduation}</span>
                    </div>
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <GpaTrendChart
                  data={termGpaHistory}
                  className="lg:col-span-2"
                />
                <RequirementProgress
                  groups={requirementGroups}
                  catalogYear={student.catalogYear}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <TermCourses terms={previewTerms} className="lg:col-span-2" />
                <AdvisorInsight
                  title={advisorInsight.title}
                  body={advisorInsight.body}
                  footnote={`Based on catalog rules · ${student.catalogYear}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-6 text-center text-sm text-muted-foreground">
        Sample student record. Switch between the current and planned semester
        above.
      </figcaption>
    </figure>
  );
}
