import type { ReactNode } from "react"
import { FlaskConical } from "lucide-react"

import { cn } from "@/lib/utils"

/** Flags behavior that is simulated in this frontend-only prototype. */
export function PrototypeNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border border-dashed border-highlight/70 bg-highlight/10 px-3.5 py-3 text-sm leading-relaxed text-highlight-foreground",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-medium">Prototype.</span> {children}
      </p>
    </div>
  )
}
