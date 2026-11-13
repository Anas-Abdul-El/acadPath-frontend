import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type TranscriptMethod = "portal" | "upload"

type Option = { value: TranscriptMethod; icon: LucideIcon; label: string; description: string }

type TranscriptMethodPickerProps = {
  value: TranscriptMethod
  onChange: (value: TranscriptMethod) => void
  options: Option[]
  disabled?: boolean
}

/** How the student provides their transcript: from the student portal, or by uploading files. */
export function TranscriptMethodPicker({ value, onChange, options, disabled }: TranscriptMethodPickerProps) {
  return (
    <div role="radiogroup" aria-label="How to add your transcript" className="grid gap-3 sm:grid-cols-2">
      {options.map(({ value: option, icon: Icon, label, description }) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors outline-none",
              "focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
              selected
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-foreground/20",
            )}
          >
            <Icon
              className={cn("mt-0.5 size-4.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">{label}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
