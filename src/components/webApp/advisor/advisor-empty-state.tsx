import { BookOpen, CalendarRange, GraduationCap, TrendingUp, type LucideIcon } from "lucide-react"

import { LogoMark } from "@/components/shared/logo"

const SUGGESTIONS: { icon: LucideIcon; prompt: string; hint: string }[] = [
  { icon: TrendingUp, prompt: "How can I improve my GPA?", hint: "Where the biggest gains are" },
  { icon: CalendarRange, prompt: "Which courses should I take next semester?", hint: "Your Spring 2027 plan, explained" },
  { icon: BookOpen, prompt: "What are the prerequisites for CS 4410?", hint: "And whether you've met them" },
  { icon: GraduationCap, prompt: "Am I on track to graduate?", hint: "Credits, semesters, critical path" },
]

export function AdvisorEmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center pt-4 text-center sm:pt-10">
      <span className="grid size-12 place-items-center rounded-full bg-surface-ink">
        <LogoMark className="size-7 brightness-0 invert" />
      </span>
      <h2 className="mt-5 font-display text-2xl tracking-tight text-foreground sm:text-3xl">
        What would you like to plan today?
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        The advisor knows your record, your semester plan, and your major's catalog. Start with a suggestion or ask your
        own question.
      </p>
      <ul className="mt-8 grid w-full gap-2.5 text-left sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, prompt, hint }) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onPick(prompt)}
              className="group flex h-full w-full items-start gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-primary/40 hover:bg-muted/50"
            >
              <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-medium text-foreground">{prompt}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
