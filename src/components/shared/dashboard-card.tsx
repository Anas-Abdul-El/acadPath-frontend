import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DashboardCardProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Card used on the dashboard and in the landing-page preview of it. */
export function DashboardCard({ title, subtitle, action, children, className }: DashboardCardProps) {
  return (
    <section
      aria-label={title}
      className={cn("min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}