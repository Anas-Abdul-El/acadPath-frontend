import { TriangleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

/** A server error that belongs to the whole form rather than one field. */
export function FormAlert({ title, message, className }: { title?: string; message: string; className?: string }) {
  return (
    <Alert variant="destructive" className={cn("py-3 pl-3.5", className)}>
      <TriangleAlert aria-hidden="true" />
      {title ? (
        <>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </>
      ) : (
        <AlertTitle className="font-normal">{message}</AlertTitle>
      )}
    </Alert>
  )
}
