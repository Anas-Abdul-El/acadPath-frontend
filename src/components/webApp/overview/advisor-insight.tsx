import type { ReactNode } from "react"
import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

type AdvisorInsightProps = {
  title: string
  body: string
  footnote: string
  /** Optional call to action shown above the footnote (e.g. a link to the advisor). */
  action?: ReactNode
  className?: string
}

/** Dark advisor card used on the dashboard and its landing-page preview. */
export function AdvisorInsight({ title, body, footnote, action, className }: AdvisorInsightProps) {
  return (
    <section
      aria-label="Advisor insight"
      className={cn(
        "flex flex-col rounded-lg border border-surface-ink bg-surface-ink p-4 text-surface-ink-foreground sm:p-5",
        className,
      )}
    >
      <p className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-highlight uppercase">
        <Sparkles aria-hidden="true" className="size-3.5" />
        AcadPath Advisor
      </p>
      <h3 className="mt-3 font-display text-xl leading-snug">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-surface-ink-foreground/75">{body}</p>
      <div className="mt-auto pt-4">
        {action ? <div className="mb-4">{action}</div> : null}
        <p className="font-mono text-[11px] text-surface-ink-foreground/60">{footnote}</p>
      </div>
    </section>
  )
}
