import {
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

import type { PlanCourseStatus } from "@/lib/academic/plan";
import { cn } from "@/lib/utils";

const PLAN_STATUS: Record<
  PlanCourseStatus,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    iconClass: string;
    pillClass: string;
  }
> = {
  completed: {
    label: "Completed",
    description: "Passed with a grade",
    icon: CircleCheck,
    iconClass: "text-success",
    pillClass: "border-success/30 bg-success/10 text-success",
  },
  current: {
    label: "In progress",
    description: "Enrolled this semester",
    icon: CircleDot,
    iconClass: "text-primary",
    pillClass: "border-primary/30 bg-primary/10 text-primary",
  },
  planned: {
    label: "Planned",
    description: "Scheduled for next semester",
    icon: Circle,
    iconClass: "text-primary",
    pillClass: "border-highlight/60 bg-highlight/15 text-highlight-foreground",
  },
  remaining: {
    label: "Remaining",
    description: "Still required, scheduled later",
    icon: CircleDashed,
    iconClass: "text-muted-foreground",
    pillClass:
      "border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground",
  },
};

export function PlanStatusIcon({
  status,
  className,
}: {
  status: PlanCourseStatus;
  className?: string;
}) {
  const { icon: Icon, iconClass } = PLAN_STATUS[status];
  return (
    <Icon
      aria-hidden="true"
      className={cn("size-4 shrink-0", iconClass, className)}
    />
  );
}

export function PlanStatusPill({
  status,
  className,
}: {
  status: PlanCourseStatus;
  className?: string;
}) {
  const { label, pillClass } = PLAN_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        pillClass,
        className,
      )}
    >
      <PlanStatusIcon status={status} className="size-3 text-current" />
      {label}
    </span>
  );
}

export function PlanLegend({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Course status legend"
      className={cn(
        "flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {(Object.keys(PLAN_STATUS) as PlanCourseStatus[]).map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5">
          <PlanStatusIcon status={status} className="size-3.5" />
          <span className="text-foreground">{PLAN_STATUS[status].label}</span>
          <span className="hidden sm:inline">
            — {PLAN_STATUS[status].description}
          </span>
        </li>
      ))}
    </ul>
  );
}
