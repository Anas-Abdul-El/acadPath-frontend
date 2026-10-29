import type { PlanCourseStatus } from "@/lib/academic/plan";

/** Solid fill per status, for roadmap segments and timeline markers. */
export const PLAN_STATUS_FILL: Record<PlanCourseStatus, string> = {
  completed: "bg-success",
  current: "bg-primary",
  planned: "bg-highlight",
  remaining: "border border-dashed border-muted-foreground/60 bg-background",
};
