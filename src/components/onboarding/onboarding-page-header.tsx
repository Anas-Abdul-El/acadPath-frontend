import type { ReactNode } from "react"

type OnboardingPageHeaderProps = {
  /** Id for the <h1>, so a surrounding form or region can reference it. */
  id?: string
  eyebrow: string
  title: ReactNode
  description: ReactNode
}

export function OnboardingPageHeader({ id, eyebrow, title, description }: OnboardingPageHeaderProps) {
  return (
    <header className="max-w-2xl">
      <p className="font-mono text-xs tracking-wide text-primary uppercase">{eyebrow}</p>
      <h1 id={id} className="mt-3 font-display text-[2.375rem] leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl">
        {title}
      </h1>
      <div className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
        {description}
      </div>
    </header>
  )
}
