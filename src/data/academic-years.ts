/** Year-of-study options shown on the onboarding transcript step. Ids are stable values for a future API. */
export const academicYears = [
  { id: "new", label: "New student — first term" },
  { id: "year-1", label: "First year" },
  { id: "year-2", label: "Second year" },
  { id: "year-3", label: "Third year" },
  { id: "year-4", label: "Fourth year" },
  { id: "year-5-plus", label: "Fifth year or above" },
] as const

export type AcademicYear = (typeof academicYears)[number]["id"]

/** A first-term student has no completed or failed courses yet, so there's no transcript. */
export const NEW_STUDENT_YEAR: AcademicYear = "new"

export function academicYearLabel(id: AcademicYear): string {
  return academicYears.find((year) => year.id === id)?.label ?? id
}
