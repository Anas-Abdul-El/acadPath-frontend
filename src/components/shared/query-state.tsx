import { Loader2, RotateCw, TriangleAlert } from "lucide-react"

import { errorMessage } from "@/api/errors"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Centered spinner for a whole screen while the session or a page's data loads. */
export function PageLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex min-h-[40vh] flex-1 items-center justify-center", className)}>
      <Loader2 aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/** Error panel with a retry button, for a query that failed to load. */
export function QueryError({
  error,
  onRetry,
  title = "We couldn't load this",
  className,
}: {
  error: unknown
  onRetry?: () => void
  title?: string
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">{errorMessage(error)}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="lg" onClick={onRetry}>
          <RotateCw data-icon="inline-start" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}

/** Placeholder block shown while a card's data loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} />
}
