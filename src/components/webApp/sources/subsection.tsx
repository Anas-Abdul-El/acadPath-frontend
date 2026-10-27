import type { ReactNode } from "react"
import { CircleCheck } from "lucide-react"

export function Subsection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-mono text-xs tracking-wide text-foreground uppercase">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export function NothingToShow({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2.5 rounded-lg border border-dashed border-border bg-card/60 px-4 py-4 text-sm text-muted-foreground">
      <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-success" />
      {message}
    </p>
  )
}
