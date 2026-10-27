import { useState } from "react"
import { ArrowLeft, ArrowRight, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Quiz } from "@/lib/sources/quiz"
import { cn } from "@/lib/utils"

type QuizTakerProps = {
  quiz: Quiz
  onSubmit: (answers: Record<string, number>) => void
}

/** One question at a time, with a navigator so students can jump back to skipped questions. */
export function QuizTaker({ quiz, onSubmit }: QuizTakerProps) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [confirming, setConfirming] = useState(false)

  const question = quiz.questions[index]
  const total = quiz.questions.length
  const answered = Object.keys(answers).length
  const unanswered = quiz.questions.filter((q) => answers[q.id] === undefined)
  const last = index === total - 1

  const submit = () => {
    if (unanswered.length && !confirming) {
      setConfirming(true)
      return
    }
    onSubmit(answers)
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question <span className="font-medium text-foreground">{index + 1}</span> of {total}
          </span>
          <span>{answered} answered</span>
        </div>
        <Progress value={(answered / total) * 100} aria-label={`${answered} of ${total} questions answered`} className="mt-2 h-1.5 bg-secondary" />
      </div>

      <fieldset key={question.id}>
        <legend className="text-base leading-snug font-medium text-foreground">{question.prompt}</legend>
        <div className="mt-4 space-y-2">
          {question.options.map((option, optionIndex) => {
            const selected = answers[question.id] === optionIndex
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40",
                  selected ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  onChange={() => {
                    setAnswers((current) => ({ ...current, [question.id]: optionIndex }))
                    setConfirming(false)
                  }}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                />
                <span>
                  <span className="mr-1.5 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + optionIndex)}.</span>
                  {option}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-current={i === index ? "step" : undefined}
            aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ", answered" : ", not answered"}`}
            className={cn(
              "grid size-7 place-items-center rounded-md border font-mono text-[11px] transition-colors",
              i === index
                ? "border-primary bg-primary text-primary-foreground"
                : answers[q.id] !== undefined
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      {confirming ? (
        <div role="alert" className="flex gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3.5 py-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-foreground">
            {unanswered.length === 1 ? "1 question is" : `${unanswered.length} questions are`} unanswered (
            {unanswered.map((q) => quiz.questions.indexOf(q) + 1).join(", ")}). Unanswered questions count as incorrect.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button variant="ghost" size="lg" onClick={() => setIndex(index - 1)} disabled={index === 0}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Previous
        </Button>
        <div className="flex gap-2">
          {!last ? (
            <Button variant="outline" size="lg" onClick={() => setIndex(index + 1)}>
              Next
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          ) : null}
          {last || confirming ? (
            <Button size="lg" onClick={submit}>
              {confirming ? "Submit anyway" : "Submit answers"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
