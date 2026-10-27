import type { ReactNode } from "react"
import { Search, SearchX, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

/** Search box + filter controls row above an admin table. */
export function TableToolbar({ children }: { children: ReactNode }) {
  return (
    <div role="search" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end">
      {children}
    </div>
  )
}

export function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="min-w-0 flex-1 sm:min-w-64">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 pr-9 pl-9"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function FilterSelect<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="sm:w-48">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <NativeSelect id={id} size="lg" className="w-full" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}

export function EmptyResults({ onClear, message = "No results match these filters." }: { onClear?: () => void; message?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <SearchX aria-hidden="true" className="size-7 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">{message}</p>
      {onClear ? (
        <Button variant="outline" size="lg" className="mt-4" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}

/** Count line under the toolbar, announced when filters change. */
export function ResultCount({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      {shown === total ? (
        <>
          <span className="font-medium text-foreground">{total}</span> {noun}
        </>
      ) : (
        <>
          Showing <span className="font-medium text-foreground">{shown}</span> of {total} {noun}
        </>
      )}
    </p>
  )
}
