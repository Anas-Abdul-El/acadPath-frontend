import { DashboardCard } from "@/components/shared/dashboard-card";
import { Progress } from "@/components/ui/progress";
import type { RequirementGroup } from "@/types/academic";

type RequirementProgressProps = {
  groups: RequirementGroup[];
  catalogYear?: string | null;
};

export function RequirementProgress({
  groups,
  catalogYear,
}: RequirementProgressProps) {
  return (
    <DashboardCard
      title="Degree requirements"
      subtitle={
        catalogYear ? `Credits by area · ${catalogYear}` : "Credits by area"
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Requirements appear once your major&rsquo;s courses are loaded.
        </p>
      ) : null}
      <ul className="space-y-4">
        {groups.map((group) => {
          const percent =
            group.required > 0
              ? Math.min(
                  100,
                  Math.round((group.completed / group.required) * 100),
                )
              : 0;
          return (
            <li key={group.name}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-foreground">{group.name}</span>
                <span className="font-mono text-muted-foreground font-tabular">
                  {group.completed}/{group.required}
                </span>
              </div>
              <Progress
                value={percent}
                aria-label={`${group.name}: ${group.completed} of ${group.required} credits`}
                className="mt-2 h-1.5 bg-secondary"
              />
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
