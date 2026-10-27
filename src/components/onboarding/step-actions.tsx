import type { ReactNode } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

type StepActionsProps = {
  backTo: string
  backLabel: string
  continueLabel: string
  /** Short status shown beside the buttons, e.g. a file count or a blocking reason. */
  status?: ReactNode
}

/** Footer for a step form: Back link plus a submit button (the surrounding <form> handles validation). */
export function StepActions({ backTo, backLabel, continueLabel, status }: StepActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <Button asChild variant="ghost" size="xl" className="justify-center text-muted-foreground sm:-ml-3">
        <Link to={backTo}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {status ? <div className="text-center text-sm text-muted-foreground sm:text-right">{status}</div> : null}
        <Button type="submit" size="xl">
          {continueLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
