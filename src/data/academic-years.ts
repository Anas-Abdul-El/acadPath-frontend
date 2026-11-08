import type { YearOfStudy } from "@/api/types"

/** Year-of-study options shown on the onboarding transcript step. Ids are the API's `YearOfStudy`. */
export const academicYears: readonly { id: YearOfStudy; label: string }[] = [
  { id: "NEW_STUDENT", label: "New student — first term" },
  { id: "YEAR_1", label: "First year" },
  { id: "YEAR_2", label: "Second year" },
  { id: "YEAR_3", label: "Third year" },
  { id: "YEAR_4", label: "Fourth year" },
  { id: "YEAR_5_PLUS", label: "Fifth year or above" },
]

export type AcademicYear = YearOfStudy

/** A first-term student has no completed or failed courses yet, so there's no transcript. */
export const NEW_STUDENT_YEAR: AcademicYear = "NEW_STUDENT"

export function academicYearLabel(id: AcademicYear): string {
  return academicYears.find((year) => year.id === id)?.label ?? id
}
