import { Building2 } from "lucide-react"
import { Link } from "react-router-dom"

import type { UniversitySelection } from "@/simulation/onboarding/university-catalog"
import { ROUTES } from "@/lib/routes"

/** Reminds the student which university the current step is for, with a way back to change it. */
export function UniversitySummary({ university }: { university: UniversitySelection }) {
  return (
    <div className="inline-flex max-w-full items-center gap-3 rounded-lg border border-border bg-card py-2 pr-3 pl-2.5 text-sm">
      <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="min-w-0 truncate">
        <span className="font-medium text-foreground">{university.name}</span>
        <span className="text-muted-foreground">
          {" "}
          · {university.city}, {university.country}
        </span>
      </p>
      <Link
        to={ROUTES.onboarding.university}
        className="shrink-0 rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        Change<span className="sr-only"> university</span>
      </Link>
    </div>
  )
}
