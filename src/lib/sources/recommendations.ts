import type { CourseSummaryDto, LearningResourceDto, RecommendationsDto } from "@/api/types"
import { gradeLabel, termLabel } from "@/lib/labels"

/** A course the student needs help with, and the resources recommended for it. */
export type FocusCourse = {
  course: CourseSummaryDto
  /** Why it matters now. */
  why: string
  /** Short status line: the failed attempt, or the expected grade. */
  detail: string | null
  resources: LearningResourceDto[]
}

export function failedFocusCourses(data: RecommendationsDto): FocusCourse[] {
  return data.failed.map(({ course, why, attempt, resources }) => {
    const grade = attempt.grade ? ` (${gradeLabel(attempt.grade)})` : ""
    const retake = attempt.retakenIn ? ` · retaken ${termLabel(attempt.retakenIn)}` : ""
    return { course, why, resources, detail: `Failed ${termLabel(attempt)}${grade}${retake}` }
  })
}

export function difficultFocusCourses(data: RecommendationsDto): FocusCourse[] {
  return data.difficult.map(({ course, why, expectedGrade, resources }) => ({
    course,
    why,
    resources,
    detail: expectedGrade ? `Expected grade ${gradeLabel(expectedGrade)}` : null,
  }))
}
