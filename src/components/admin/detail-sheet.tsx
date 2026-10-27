import type { ReactNode } from "react"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type DetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Right-hand panel for viewing one record without leaving the list. */
export function DetailSheet({ open, onOpenChange, title, description, children, footer }: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 bg-background p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-5 py-4 pr-12">
          <SheetTitle className="font-display text-2xl font-normal tracking-tight">{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  )
}

/** Label/value rows used inside detail sheets. */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-2.5">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DetailSection({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}
