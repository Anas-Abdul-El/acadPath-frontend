import {
  CircleCheck,
  CircleDot,
  CircleAlert,
  type LucideIcon,
} from "lucide-react";

import type { CourseStatus } from "@/mock/student-preview";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  CourseStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  "in-progress": {
    label: "In progress",
    icon: CircleDot,
    className: "text-primary",
  },
  ready: { label: "Ready", icon: CircleCheck, className: "text-success" },
  "prereq-pending": {
    label: "Prereq pending",
    icon: CircleAlert,
    className: "text-warning",
  },
};

export function CourseStatusLabel({ status }: { status: CourseStatus }) {
  const { label, icon: Icon, className } = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-foreground">
      <Icon aria-hidden="true" className={cn("size-3.5", className)} />
      {label}
    </span>
  );
}
