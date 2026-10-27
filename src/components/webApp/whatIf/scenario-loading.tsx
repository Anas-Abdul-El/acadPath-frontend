import { Loader2 } from "lucide-react"

export function ScenarioLoading({ scenario }: { scenario: string }) {
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        Estimating the impact of “{scenario}”…
      </p>
      <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div aria-hidden="true" className="h-56 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}
