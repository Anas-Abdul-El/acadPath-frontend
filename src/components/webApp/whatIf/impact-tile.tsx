import type { ReactNode } from "react"
import { ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

type ImpactTileProps = {
  label: string
  current: ReactNode
  scenario: ReactNode
  /** Short delta text, e.g. "−0.27" or "+1 semester". */
  delta: string
  effect: "better" | "worse" | "neutral"
  footnote: string
}

const EFFECT = {
  better: { icon: TrendingUp, className: "text-success", label: "Better than current plan" },
  worse: { icon: TrendingDown, className: "text-destructive", label: "Worse than current plan" },
  neutral: { icon: Minus, className: "text-muted-foreground", label: "No change" },
}

export function ImpactTile({ label, current, scenario, delta, effect, footnote }: ImpactTileProps) {
  const { icon: Icon, className, label: effectLabel } = EFFECT[effect]
  return (
    <div className="flex flex-col gap-3 bg-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-2xl leading-none tracking-tight text-foreground font-tabular sm:text-[1.75rem]">
        <span className="text-muted-foreground">{current}</span>
        <ArrowRight aria-label="becomes" className="size-4 self-center text-muted-foreground" />
        <span>{scenario}</span>
      </p>
      <p className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
        <Icon aria-hidden="true" className="size-3.5" />
        {delta}
        <span className="sr-only">({effectLabel})</span>
      </p>
      <p className="text-xs text-muted-foreground">{footnote}</p>
    </div>
  )
}
