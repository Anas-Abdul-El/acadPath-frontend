import { useId, type ReactNode } from "react"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

export type ControlProps = {
  id: string
  "aria-invalid": boolean
  "aria-describedby": string | undefined
}

type FormFieldProps = {
  label: ReactNode
  description?: ReactNode
  error?: string
  /** Optional element aligned with the label, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode
  /** Receives the id and ARIA wiring so the control is linked to its label, hint, and error. */
  children: (control: ControlProps) => ReactNode
  className?: string
}

export function FormField({ label, description, error, labelAction, children, className }: FormFieldProps) {
  const id = useId()
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, descriptionId].filter(Boolean).join(" ") || undefined

  return (
    <Field data-invalid={Boolean(error)} className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <FieldLabel htmlFor={id} className="text-foreground">
          {label}
        </FieldLabel>
        {labelAction}
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <FieldError id={errorId} role={undefined}>
          {error}
        </FieldError>
      ) : description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
    </Field>
  )
}
