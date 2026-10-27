import { cn } from "@/lib/utils"

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "highlight"

const TONES: Record<BadgeTone, { badge: string; dot: string }> = {
  success: { badge: "border-success/30 bg-success/10 text-success", dot: "bg-success" },
  warning: {
    badge: "border-warning/30 bg-warning/10 text-[color-mix(in_oklch,var(--warning),var(--foreground)_30%)]",
    dot: "bg-warning",
  },
  danger: { badge: "border-destructive/30 bg-destructive/10 text-destructive", dot: "bg-destructive" },
  info: { badge: "border-primary/30 bg-primary/10 text-primary", dot: "bg-primary" },
  highlight: { badge: "border-highlight/60 bg-highlight/15 text-highlight-foreground", dot: "bg-highlight" },
  neutral: { badge: "border-border bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
}

/** Status label with a colored dot — color is never the only signal, the text always is. */
export function StatusBadge({ tone, children, className }: { tone: BadgeTone; children: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        TONES[tone].badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", TONES[tone].dot)} />
      {children}
    </span>
  )
}
