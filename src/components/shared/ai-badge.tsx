import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

/** Marks content produced (or simulated) by AI, consistently across pages. */
export function AiBadge({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-highlight/60 bg-highlight/15 px-2.5 py-1 font-mono text-[11px] tracking-wide text-highlight-foreground uppercase",
        className,
      )}
    >
      <Sparkles aria-hidden="true" className="size-3" />
      {children}
    </span>
  )
}
