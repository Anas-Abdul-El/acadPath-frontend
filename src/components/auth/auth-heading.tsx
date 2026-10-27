import type { ReactNode } from "react"

export function AuthHeading({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-[2.125rem] leading-tight tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
