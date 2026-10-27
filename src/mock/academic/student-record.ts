/**
 * Sample academic record — what AcadPath would extract from the student's transcript.
 * Course details (titles, credits) come from the catalog; this file only holds what's
 * specific to the student. Replace with the real transcript API response later.
 */
import type { LetterGrade } from "@/lib/gpa"

export type CompletedCourse = { code: string; grade: LetterGrade }

export type CompletedTerm = {
  id: string
  label: string
  shortLabel: string
  courses: CompletedCourse[]
}

export type EnrolledCourse = {
  code: string
  /** Latest coursework signal, e.g. a midterm score or an upcoming deadline. */
  detail: string
  /** Current standing, used as the default "expected grade" in What-If estimates. */
  standing: LetterGrade
}

export const studentProfile = {
  firstName: "Omar",
  lastName: "Haddad",
  program: "B.Sc. Computer Science",
  university: "Northfield University",
  year: "Year 4",
  catalogYear: "2023–24 catalog",
  advisor: "Dr. Leila Navarro",
}

export const completedTerms: CompletedTerm[] = [
  {
    id: "fall-2023",
    label: "Fall 2023",
    shortLabel: "F23",
    courses: [
      { code: "CS 1110", grade: "A-" },
      { code: "MATH 1210", grade: "B" },
      { code: "ENGL 1010", grade: "B+" },
      { code: "HIST 1100", grade: "B-" },
      { code: "UNIV 1000", grade: "A" },
    ],
  },
  {
    id: "spring-2024",
    label: "Spring 2024",
    shortLabel: "S24",
    courses: [
      { code: "CS 1120", grade: "A-" },
      { code: "MATH 1220", grade: "B+" },
      { code: "PHYS 2110", grade: "B" },
      { code: "COMM 1020", grade: "A-" },
    ],
  },
  {
    id: "fall-2024",
    label: "Fall 2024",
    shortLabel: "F24",
    courses: [
      { code: "CS 2110", grade: "B+" },
      { code: "CS 2050", grade: "A-" },
      { code: "MATH 2310", grade: "B" },
      { code: "PHYS 2120", grade: "B+" },
    ],
  },
  {
    id: "spring-2025",
    label: "Spring 2025",
    shortLabel: "S25",
    courses: [
      { code: "CS 2210", grade: "A-" },
      { code: "CS 2340", grade: "A" },
      { code: "ECON 1010", grade: "B+" },
      { code: "PSYC 1010", grade: "A-" },
      { code: "ARTS 1200", grade: "A" },
    ],
  },
  {
    id: "fall-2025",
    label: "Fall 2025",
    shortLabel: "F25",
    courses: [
      { code: "CS 2500", grade: "A-" },
      { code: "CS 2650", grade: "A" },
      { code: "SOCI 1010", grade: "B+" },
      { code: "BIOL 1050", grade: "A-" },
    ],
  },
  {
    id: "spring-2026",
    label: "Spring 2026",
    shortLabel: "S26",
    courses: [
      { code: "CS 3010", grade: "A-" },
      { code: "CS 3300", grade: "A" },
      { code: "MATH 2500", grade: "B+" },
      { code: "GEOG 1100", grade: "A" },
      { code: "UNIV 2000", grade: "A" },
    ],
  },
]

export const currentTerm = {
  id: "fall-2026",
  label: "Fall 2026",
  week: 8,
  weeks: 15,
  courses: [
    { code: "CS 3110", detail: "Midterm: 84%", standing: "B+" },
    { code: "CS 3200", detail: "Lab 4 due Oct 21", standing: "A-" },
    { code: "CS 3520", detail: "Project milestone 2", standing: "A-" },
    { code: "MATH 3150", detail: "Quiz 5 on Oct 23", standing: "B" },
    { code: "ENGL 2040", detail: "Draft review", standing: "A" },
  ] satisfies EnrolledCourse[],
}

export type FailedAttempt = {
  code: string
  term: string
  grade: LetterGrade
  /** Term the course was retaken in, if it has been. */
  retakenIn?: string
}

/**
 * Attempts that ended in a fail. Under the grade-replacement policy the retake's grade replaces
 * the F, so these don't count toward the GPA or credits above.
 */
export const failedAttempts: FailedAttempt[] = [{ code: "CS 2050", term: "Spring 2024", grade: "F", retakenIn: "Fall 2024" }]
