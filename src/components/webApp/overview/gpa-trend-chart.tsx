import { lazy, Suspense } from "react";

import { DashboardCard } from "@/components/shared/dashboard-card";
import type { TermGpa } from "@/types/academic";

const GpaTrendPlot = lazy(
  () => import("@/components/webApp/overview/gpa-trend-plot"),
);

type GpaTrendChartProps = {
  data: TermGpa[];
  className?: string;
};

export function GpaTrendChart({ data, className }: GpaTrendChartProps) {
  const first = data.at(0);
  const latest = data.at(-1);

  if (!first || !latest)
    return (
      <DashboardCard
        className={className}
        title="Term GPA"
        subtitle="No graded semesters yet"
      >
        <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border px-6 text-center text-sm text-muted-foreground sm:h-52">
          Your GPA trend appears here once your first semester is graded.
        </div>
      </DashboardCard>
    );

  return (
    <DashboardCard
      className={className}
      title="Term GPA"
      subtitle={`${first.term} – ${latest.term}`}
      action={
        <p className="text-right text-xs text-muted-foreground">
          Latest
          <span className="ml-1.5 font-mono text-sm text-foreground font-tabular">
            {latest.gpa.toFixed(2)}
          </span>
        </p>
      }
    >
      <div className="h-48 sm:h-52" aria-hidden="true">
        <Suspense
          fallback={
            <div className="size-full animate-pulse rounded-md bg-muted" />
          }
        >
          <GpaTrendPlot data={data} />
        </Suspense>
      </div>

      <table className="sr-only">
        <caption>Term GPA by semester</caption>
        <thead>
          <tr>
            <th scope="col">Term</th>
            <th scope="col">GPA</th>
            <th scope="col">Credits</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.term}>
              <th scope="row">{point.term}</th>
              <td>{point.gpa.toFixed(2)}</td>
              <td>{point.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardCard>
  );
}
