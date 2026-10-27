import type { ReactNode } from "react"

type AppPageHeaderProps = {
  title: ReactNode
  description: ReactNode
  /** Optional controls aligned to the right on wide screens (e.g. a primary action). */
  actions?: ReactNode
  /** Small line above the title, e.g. a status badge. */
  eyebrow?: ReactNode
}

export function AppPageHeader({ title, description, actions, eyebrow }: AppPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
        <h1 className="font-display text-3xl leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
