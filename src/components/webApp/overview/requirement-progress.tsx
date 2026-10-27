import { DashboardCard } from "@/components/shared/dashboard-card";
import { Progress } from "@/components/ui/progress";
import type { RequirementGroup } from "@/mock/student-preview";

type RequirementProgressProps = {
  groups: RequirementGroup[];
  catalogYear: string;
};

export function RequirementProgress({
  groups,
  catalogYear,
}: RequirementProgressProps) {
  return (
    <DashboardCard
      title="Degree requirements"
      subtitle={`Credits by area · ${catalogYear}`}
    >
      <ul className="space-y-4">
        {groups.map((group) => {
          const percent = Math.round((group.completed / group.required) * 100);
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
