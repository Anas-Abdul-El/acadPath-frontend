import type { QuizDto, QuizQuestionDto } from "@/api/types"

/** Quizzes come from `POST /api/quizzes`; they aren't stored, so scoring happens here. */
export type Quiz = QuizDto
export type QuizQuestion = QuizQuestionDto

export const QUESTION_COUNTS = [5, 10, 15] as const
export type QuestionCount = (typeof QUESTION_COUNTS)[number]

export function scoreQuiz(quiz: Quiz, answers: Record<string, number>) {
  const correct = quiz.questions.filter((question) => answers[question.id] === question.answer).length
  return {
    correct,
    total: quiz.questions.length,
    percent: quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0,
  }
}
