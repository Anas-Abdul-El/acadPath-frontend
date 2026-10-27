import type { ReactNode } from "react"

type StatTileProps = {
  label: string
  value: ReactNode
  unit?: string
  footer: ReactNode
}

export function StatTile({ label, value, unit, footer }: StatTileProps) {
  return (
    <div className="flex flex-col justify-between gap-3 bg-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-3xl leading-none tracking-tight text-foreground font-tabular sm:text-[2.125rem]">
        {value}
        {unit ? (
          <span className="ml-1 font-sans text-sm tracking-normal text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </p>
      <div className="text-xs text-muted-foreground">{footer}</div>
    </div>
  )
}