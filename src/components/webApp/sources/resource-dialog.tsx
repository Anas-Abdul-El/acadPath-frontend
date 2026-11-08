import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Clock, ExternalLink, ListChecks, Loader2 } from "lucide-react"

import { errorMessage, isCancelled } from "@/api/errors"
import { generateQuiz } from "@/api/resources"
import type { LearningResourceDto } from "@/api/types"
import { QuizResults } from "@/components/webApp/sources/quiz-results"
import { QuizTaker } from "@/components/webApp/sources/quiz-taker"
import { DifficultyLabel, PlatformBadge, PlatformIcon, ResourceThumbnail } from "@/components/webApp/sources/platform"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIFFICULTY_LABEL, PLATFORMS } from "@/lib/labels"
import { QUESTION_COUNTS, type QuestionCount, type Quiz } from "@/lib/sources/quiz"
import { cn } from "@/lib/utils"

type View =
  | { kind: "details" }
  | { kind: "setup" }
  | { kind: "generating"; count: QuestionCount }
  | { kind: "quiz"; quiz: Quiz }
  | { kind: "results"; quiz: Quiz; answers: Record<string, number> }
  | { kind: "error"; count: QuestionCount; message: string }

type ResourceDialogProps = {
  resource: LearningResourceDto | null
  onOpenChange: (open: boolean) => void
}

/** Resource details plus the practice-quiz flow: setup → generating → quiz → results. */
export function ResourceDialog({ resource, onOpenChange }: ResourceDialogProps) {
  return (
    <Dialog open={resource !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {resource ? <ResourceDialogBody key={resource.id} resource={resource} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ResourceDialogBody({ resource }: { resource: LearningResourceDto }) {
  const [view, setView] = useState<View>({ kind: "details" })
  const [count, setCount] = useState<QuestionCount>(5)
  const abortRef = useRef<AbortController | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const courses = resource.courses
  const platform = PLATFORMS[resource.platform].label
  // The quiz's own topic label replaces this once a quiz has been generated.
  const topic = view.kind === "quiz" || view.kind === "results" ? view.quiz.topic : (resource.topics[0] ?? resource.title)

  useEffect(() => () => abortRef.current?.abort(), [])

  // Each step starts at the top of the (scrolling) dialog, with the resource title visible.
  const go = (next: View) => {
    setView(next)
    requestAnimationFrame(() => bodyRef.current?.closest("[role=dialog]")?.scrollTo({ top: 0 }))
  }

  const generate = async (questions: QuestionCount) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    go({ kind: "generating", count: questions })
    try {
      const quiz = await generateQuiz({ resourceId: resource.id, count: questions }, controller.signal)
      go({ kind: "quiz", quiz })
    } catch (err) {
      if (!controller.signal.aborted && !isCancelled(err))
        go({ kind: "error", count: questions, message: errorMessage(err) })
    }
  }

  const inQuiz = view.kind !== "details"

  return (
    <>
      <DialogHeader className="border-b border-border px-5 py-4 pr-12">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={resource.platform} />
          {inQuiz ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ListChecks aria-hidden="true" className="size-3.5" />
              Practice quiz · {topic}
            </span>
          ) : null}
        </div>
        <DialogTitle className="font-display text-2xl leading-tight font-normal tracking-tight">{resource.title}</DialogTitle>
        <DialogDescription>{[resource.provider, resource.format].filter(Boolean).join(" · ") || platform}</DialogDescription>
      </DialogHeader>

      <div ref={bodyRef} className="px-5 py-5" aria-live="polite">
        {view.kind === "details" ? (
          <div className="space-y-5">
            <ResourceThumbnail resource={resource} className="rounded-lg border border-border" />
            {resource.description ? (
              <p className="text-[0.9375rem] leading-relaxed text-foreground">{resource.description}</p>
            ) : null}

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm sm:grid-cols-3">
              <div className="bg-card px-3.5 py-2.5">
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1 text-foreground">
                  <Clock aria-hidden="true" className="size-3.5 text-muted-foreground" />
                  {resource.duration ?? "Not listed"}
                </dd>
              </div>
              <div className="bg-card px-3.5 py-2.5">
                <dt className="text-xs text-muted-foreground">Level</dt>
                <dd className="mt-0.5 text-foreground">
                  {resource.difficulty ? <DifficultyLabel difficulty={resource.difficulty} /> : "Not listed"}
                </dd>
              </div>
              <div className="col-span-2 bg-card px-3.5 py-2.5 sm:col-span-1">
                <dt className="text-xs text-muted-foreground">Platform</dt>
                <dd className="mt-0.5 text-foreground">{platform}</dd>
              </div>
            </dl>

            {courses.length > 0 ? (
              <div>
                <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">Helps with</h3>
                <ul className="mt-2 space-y-1.5">
                  {courses.map((course) => (
                    <li key={course.id} className="text-sm text-foreground">
                      <span className="font-mono text-xs text-muted-foreground">{course.code}</span> {course.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <p className="font-medium text-foreground">Finished studying?</p>
                <p className="text-muted-foreground">Check your understanding with an AI-generated practice quiz on {topic}.</p>
              </div>
              <Button size="lg" onClick={() => go({ kind: "setup" })} className="shrink-0">
                <ListChecks data-icon="inline-start" aria-hidden="true" />
                Generate quiz
              </Button>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {resource.verified
                  ? `Opens ${platform} in a new tab.`
                  : `Found by AI and not reviewed yet — opens ${platform} in a new tab.`}
              </p>
              <Button asChild variant="outline" size="lg" className="shrink-0">
                <a href={resource.url} target="_blank" rel="noreferrer">
                  <PlatformIcon platform={resource.platform} className="size-4" />
                  Open on {platform}
                  <ExternalLink data-icon="inline-end" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            </div>
          </div>
        ) : null}

        {view.kind === "setup" ? (
          <div className="space-y-5">
            <fieldset>
              <legend className="text-sm font-medium text-foreground">How many questions?</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {QUESTION_COUNTS.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer flex-col items-center rounded-lg border px-3 py-3 text-center transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                      count === option ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <input
                      type="radio"
                      name="question-count"
                      value={option}
                      checked={count === option}
                      onChange={() => setCount(option)}
                      className="sr-only"
                    />
                    <span className="font-display text-2xl text-foreground">{option}</span>
                    <span className="text-xs text-muted-foreground">questions</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Questions are written by AI for this resource&rsquo;s topics
              {resource.difficulty ? ` at a ${DIFFICULTY_LABEL[resource.difficulty].toLowerCase()} level` : ""}. The quiz isn&rsquo;t
              saved, and occasionally it has fewer questions than you asked for.
            </p>
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
              <Button variant="ghost" size="lg" onClick={() => go({ kind: "details" })}>
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Back to resource
              </Button>
              <Button size="lg" onClick={() => void generate(count)}>
                Generate {count}-question quiz
              </Button>
            </div>
          </div>
        ) : null}

        {view.kind === "generating" ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Loader2 aria-hidden="true" className="size-6 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">Preparing {view.count} questions…</p>
            <p className="mt-1 text-xs text-muted-foreground">Writing questions for {topic}. This takes a few seconds.</p>
          </div>
        ) : null}

        {view.kind === "error" ? (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm font-medium text-foreground">The quiz couldn&rsquo;t be prepared.</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{view.message}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" size="lg" onClick={() => go({ kind: "details" })}>
                Back to resource
              </Button>
              <Button size="lg" onClick={() => void generate(view.count)}>
                Try again
              </Button>
            </div>
          </div>
        ) : null}

        {view.kind === "quiz" ? (
          <QuizTaker key={view.quiz.id} quiz={view.quiz} onSubmit={(answers) => go({ kind: "results", quiz: view.quiz, answers })} />
        ) : null}

        {view.kind === "results" ? (
          <QuizResults
            quiz={view.quiz}
            answers={view.answers}
            onRetry={() => void generate(count)}
            onBack={() => go({ kind: "details" })}
          />
        ) : null}
      </div>
    </>
  )
}
