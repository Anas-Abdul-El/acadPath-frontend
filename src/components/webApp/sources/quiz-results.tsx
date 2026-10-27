import { ArrowLeft, Check, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { scoreQuiz, type Quiz } from "@/lib/sources/quiz"
import { cn } from "@/lib/utils"

type QuizResultsProps = {
  quiz: Quiz
  answers: Record<string, number>
  onRetry: () => void
  onBack: () => void
}

function verdict(percent: number) {
  if (percent >= 90) return "Excellent — you've got this topic."
  if (percent >= 70) return "Good work. Review the ones you missed."
  if (percent >= 50) return "Getting there. The explanations below show where to focus."
  return "This topic needs more practice. Revisit the resource, then try again."
}

export function QuizResults({ quiz, answers, onRetry, onBack }: QuizResultsProps) {
  const { correct, total, percent } = scoreQuiz(quiz, answers)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full border-4 border-primary/20">
          <span className="font-display text-xl text-foreground font-tabular">{percent}%</span>
        </div>
        <div>
          <p className="text-base font-medium text-foreground">
            {correct} of {total} correct
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{verdict(percent)}</p>
        </div>
      </div>

      <ol className="space-y-3">
        {quiz.questions.map((question, index) => {
          const chosen = answers[question.id]
          const right = chosen === question.answer
          return (
            <li key={question.id} className={cn("rounded-lg border p-4", right ? "border-success/30" : "border-destructive/30")}>
              <p className="flex gap-2 text-sm font-medium text-foreground">
                {right ? (
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
                <span>
                  <span className="sr-only">{right ? "Correct. " : "Incorrect. "}</span>
                  {index + 1}. {question.prompt}
                </span>
              </p>
              <div className="mt-2 space-y-1 pl-6 text-sm">
                {!right ? (
                  <p className="text-muted-foreground">
                    Your answer:{" "}
                    <span className="text-destructive">{chosen === undefined ? "No answer" : question.options[chosen]}</span>
                  </p>
                ) : null}
                <p className="text-muted-foreground">
                  Correct answer: <span className="font-medium text-success">{question.options[question.answer]}</span>
                </p>
                <p className="pt-1 leading-relaxed text-foreground/85">{question.explanation}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
        <Button variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to resource
        </Button>
        <Button size="lg" onClick={onRetry}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Retry quiz
        </Button>
      </div>
    </div>
  )
}
