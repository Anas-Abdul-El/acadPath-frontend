import { useId, useState, type ComponentType } from "react"
import { ArrowRight, Check, CircleAlert, PlayCircle, GraduationCap, FileText } from "lucide-react"

import { student } from "@/mock/student-preview"
import type { FeatureId } from "@/data/landing"
import { projectGpa, type LetterGrade } from "@/lib/gpa"
import { cn } from "@/lib/utils"

const plannedTerms = [
  { term: "Fall 26", credits: 15, codes: ["CS 3110", "CS 3520"] },
  { term: "Spring 27", credits: 16, codes: ["CS 3410", "CS 3600"] },
  { term: "Fall 27", credits: 15, codes: ["CS 4410", "CS 4820"] },
  { term: "Spring 28", credits: 14, codes: ["CS 4990", "Capstone"] },
]

function PlanningVignette() {
  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {plannedTerms.map((term, index) => (
        <li key={term.term} className="rounded-md border border-border bg-background p-2.5">
          <p className="flex items-center justify-between text-[11px] text-muted-foreground">
            {term.term}
            {index === 0 ? (
              <span className="size-1.5 rounded-full bg-highlight">
                <span className="sr-only">Current term</span>
              </span>
            ) : null}
          </p>
          <p className="mt-1 font-mono text-xs text-foreground font-tabular">{term.credits} cr</p>
          <ul className="mt-2 space-y-1">
            {term.codes.map((code) => (
              <li key={code} className="truncate rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground">
                {code}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}

const whatIfGrades: LetterGrade[] = ["A", "B+", "B", "C+"]
const WHAT_IF_COURSE = { code: "CS 3410", credits: 4 }

function WhatIfVignette() {
  const [grade, setGrade] = useState<LetterGrade>("B+")
  const groupName = useId()
  const projected = projectGpa(
    student.cumulativeGpa,
    student.creditsCompleted,
    WHAT_IF_COURSE.credits,
    grade,
  )
  const delta = projected - student.cumulativeGpa

  return (
    <div className="rounded-md border border-border bg-background p-3.5">
      <fieldset>
        <legend className="text-xs text-muted-foreground">
          If I earn in <span className="font-mono text-foreground">{WHAT_IF_COURSE.code}</span>…
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {whatIfGrades.map((option) => (
            <label key={option} className="cursor-pointer">
              <input
                type="radio"
                name={groupName}
                value={option}
                checked={grade === option}
                onChange={() => setGrade(option)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-grid h-8 min-w-11 place-items-center rounded-md border px-2.5 font-mono text-xs transition-colors",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                  grade === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary/50",
                )}
              >
                {option}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-3.5 flex items-center gap-3 border-t border-border pt-3" aria-live="polite">
        <span className="font-mono text-sm text-muted-foreground font-tabular">
          {student.cumulativeGpa.toFixed(2)}
        </span>
        <ArrowRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
        <span className="font-display text-2xl leading-none text-foreground font-tabular">
          {projected.toFixed(2)}
        </span>
        <span
          className={cn(
            "font-mono text-xs font-tabular",
            delta >= 0 ? "text-success" : "text-warning",
          )}
        >
          {delta >= 0 ? "+" : "−"}
          {Math.abs(delta).toFixed(2)}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">projected GPA</span>
      </div>
    </div>
  )
}

function GuidanceVignette() {
  return (
    <div className="space-y-2.5 text-[13px]">
      <p className="ml-auto w-fit max-w-[85%] rounded-md rounded-br-sm bg-secondary px-3 py-2 text-secondary-foreground">
        Which elective fits a data science career?
      </p>
      <div className="max-w-[92%] rounded-md rounded-bl-sm border border-border bg-background px-3 py-2.5">
        <p className="text-foreground">
          <span className="font-mono text-xs">CS 4820</span> Data Mining, in Spring 2027.
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Check aria-hidden="true" className="size-3.5 text-success" />
            Counts toward technical electives
          </li>
          <li className="flex items-center gap-1.5">
            <CircleAlert aria-hidden="true" className="size-3.5 text-warning" />
            Requires MATH 3150, which you’re taking now
          </li>
        </ul>
      </div>
    </div>
  )
}

const resources = [
  { icon: PlayCircle, platform: "YouTube", title: "Eigenvalues & eigenvectors, visually", meta: "17 min" },
  { icon: GraduationCap, platform: "Coursera", title: "Linear Algebra for Machine Learning", meta: "Module 3" },
  { icon: FileText, platform: "Udemy", title: "Matrix decomposition practice set", meta: "42 problems" },
]

function ResourcesVignette() {
  return (
    <div className="rounded-md border border-border bg-background">
      <p className="border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
        For <span className="font-mono text-foreground">MATH 2210</span> · Linear Algebra · weak
        topic: eigenvalues
      </p>
      <ul>
        {resources.map(({ icon: Icon, platform, title, meta }) => (
          <li
            key={platform}
            className="flex items-center gap-3 border-b border-border/70 px-3 py-2 last:border-b-0"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-[13px] text-foreground">{title}</p>
              <p className="text-[11px] text-muted-foreground">
                {platform} · {meta}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const vignettes: Record<FeatureId, ComponentType> = {
  planning: PlanningVignette,
  "what-if": WhatIfVignette,
  guidance: GuidanceVignette,
  resources: ResourcesVignette,
}

export function FeatureVignette({ id }: { id: FeatureId }) {
  const Vignette = vignettes[id]
  return <Vignette />
}
