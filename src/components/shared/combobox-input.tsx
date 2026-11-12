import { useId, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react"
import { cn } from "cn"
import { Check, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"

export type ComboboxOption = {
  id: string
  label: string
  description?: ReactNode
  /** Shown before the label, e.g. a flag. */
  leading?: ReactNode
}

type ComboboxInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "onSelect" | "role"> & {
  value: string
  onValueChange: (value: string) => void
  options: ComboboxOption[]
  onSelectOption: (option: ComboboxOption) => void
  loading?: boolean
  /** Shown in place of options, e.g. "Type 3 or more letters" or a failed-lookup notice. */
  message?: ReactNode
  /** Accessible name of the suggestion list. */
  listLabel: string
}

/**
 * A free-text input with a suggestion list (ARIA 1.2 combobox, list autocomplete). Students can
 * always type their own value — suggestions only help them get it right faster.
 */
export function ComboboxInput({
  value,
  onValueChange,
  options,
  onSelectOption,
  loading = false,
  message,
  listLabel,
  className,
  onBlur,
  onFocus,
  onKeyDown,
  disabled,
  ...inputProps
}: ComboboxInputProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const active = activeIndex < options.length ? activeIndex : -1
  const optionId = (index: number) => `${listId}-option-${index}`
  const hasContent = options.length > 0 || loading || Boolean(message)
  const expanded = open && !disabled && hasContent
  const selected = value.trim().toLowerCase()

  const select = (option: ComboboxOption) => {
    onSelectOption(option)
    setOpen(false)
    setActiveIndex(-1)
  }

  const moveTo = (index: number) => {
    setActiveIndex(index)
    document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setOpen(true)
        if (options.length) moveTo(active < options.length - 1 ? active + 1 : 0)
        break
      case "ArrowUp":
        event.preventDefault()
        setOpen(true)
        if (options.length) moveTo(active > 0 ? active - 1 : options.length - 1)
        break
      case "Enter":
        // Only intercept Enter to pick a highlighted suggestion; otherwise let the form submit.
        if (expanded && active >= 0) {
          event.preventDefault()
          select(options[active])
        }
        break
      case "Escape":
        if (expanded) {
          event.preventDefault()
          setOpen(false)
          setActiveIndex(-1)
        }
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <div className="relative">
      <Input
        {...inputProps}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        disabled={disabled}
        value={value}
        onChange={(event) => {
          onValueChange(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={(event) => {
          setOpen(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setOpen(false)
          setActiveIndex(-1)
          onBlur?.(event)
        }}
        onKeyDown={handleKeyDown}
        className={cn(loading && "pr-9", className)}
      />

      {loading ? (
        <Loader2
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      ) : null}

      <div
        className={cn(
          "absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg shadow-foreground/5",
          !expanded && "hidden",
        )}
      >
        <ul id={listId} role="listbox" aria-label={listLabel} className="max-h-64 overflow-y-auto p-1">
          {options.map((option, index) => {
            const isSelected = option.label.toLowerCase() === selected
            return (
              <li
                key={option.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                // Keep focus in the input so blur doesn't close the list before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
                onMouseMove={() => index !== active && setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                  index === active && "bg-accent text-accent-foreground",
                )}
              >
                {option.leading ? (
                  <span aria-hidden="true" className="shrink-0 text-base leading-none">
                    {option.leading}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.description ? (
                    <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
                  ) : null}
                </span>
                {isSelected ? <Check aria-hidden="true" className="size-4 shrink-0 text-primary" /> : null}
              </li>
            )
          })}
        </ul>
        {options.length === 0 && (loading || message) ? (
          <p className="px-3.5 py-3 text-sm text-muted-foreground" aria-live="polite">
            {loading ? "Searching…" : message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
