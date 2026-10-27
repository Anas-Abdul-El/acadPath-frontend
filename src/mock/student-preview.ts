/**
 * Sample student record used by the landing-page dashboard preview.
 * Shaped like a future API response so the preview can later be fed real data.
 */

export type RequirementGroup = {
  name: string
  completed: number
  required: number
}

export type TermGpa = {
  term: string
  shortTerm: string
  gpa: number
  credits: number
}

export type CourseStatus = "in-progress" | "ready" | "prereq-pending"

export type PreviewCourse = {
  code: string
  title: string
  credits: number
  category: "Core" | "Mathematics" | "Elective" | "Gen Ed"
  status: CourseStatus
  detail: string
}

export type PreviewTerm = {
  id: string
  label: string
  tag: "Current" | "Planned"
  courses: PreviewCourse[]
}

export const student = {
  firstName: "Omar",
  lastName: "Haddad",
  initials: "OH",
  program: "B.Sc. Computer Science",
  university: "Northfield University",
  year: "Year 3",
  catalogYear: "2023–24 catalog",
  cumulativeGpa: 3.54,
  gpaChange: 0.09,
  creditsCompleted: 87,
  creditsRequired: 128,
  currentTerm: "Fall 2026",
  currentTermCredits: 15,
  currentWeek: 8,
  weeksInTerm: 15,
  expectedGraduation: "May 2028",
} as const

export const termGpaHistory: TermGpa[] = [
  { term: "Fall 2023", shortTerm: "F23", gpa: 3.21, credits: 15 },
  { term: "Spring 2024", shortTerm: "S24", gpa: 3.45, credits: 15 },
  { term: "Fall 2024", shortTerm: "F24", gpa: 3.38, credits: 14 },
  { term: "Spring 2025", shortTerm: "S25", gpa: 3.67, credits: 16 },
  { term: "Fall 2025", shortTerm: "F25", gpa: 3.72, credits: 14 },
  { term: "Spring 2026", shortTerm: "S26", gpa: 3.81, credits: 13 },
]

export const requirementGroups: RequirementGroup[] = [
  { name: "Computer Science core", completed: 36, required: 54 },
  { name: "Mathematics", completed: 15, required: 18 },
  { name: "General education", completed: 27, required: 36 },
  { name: "Technical electives", completed: 9, required: 20 },
]

export const previewTerms: PreviewTerm[] = [
  {
    id: "fall-2026",
    label: "Fall 2026",
    tag: "Current",
    courses: [
      {
        code: "CS 3110",
        title: "Algorithms & Complexity",
        credits: 3,
        category: "Core",
        status: "in-progress",
        detail: "Midterm: 84%",
      },
      {
        code: "CS 3200",
        title: "Computer Networks",
        credits: 3,
        category: "Core",
        status: "in-progress",
        detail: "Lab 4 due Oct 21",
      },
      {
        code: "CS 3520",
        title: "Database Systems",
        credits: 3,
        category: "Core",
        status: "in-progress",
        detail: "Project milestone 2",
      },
      {
        code: "MATH 3150",
        title: "Probability & Statistics",
        credits: 3,
        category: "Mathematics",
        status: "in-progress",
        detail: "Quiz 5 on Oct 23",
      },
      {
        code: "ENGL 2040",
        title: "Technical Writing",
        credits: 3,
        category: "Gen Ed",
        status: "in-progress",
        detail: "Draft review",
      },
    ],
  },
  {
    id: "spring-2027",
    label: "Spring 2027",
    tag: "Planned",
    courses: [
      {
        code: "CS 3410",
        title: "Operating Systems",
        credits: 4,
        category: "Core",
        status: "ready",
        detail: "Prerequisites met",
      },
      {
        code: "CS 4820",
        title: "Data Mining",
        credits: 3,
        category: "Elective",
        status: "prereq-pending",
        detail: "Needs MATH 3150 (in progress)",
      },
      {
        code: "CS 3600",
        title: "Software Engineering",
        credits: 3,
        category: "Core",
        status: "ready",
        detail: "Prerequisites met",
      },
      {
        code: "PHIL 2210",
        title: "Ethics of Technology",
        credits: 3,
        category: "Gen Ed",
        status: "ready",
        detail: "Fulfils humanities",
      },
      {
        code: "STAT 3300",
        title: "Applied Regression",
        credits: 3,
        category: "Mathematics",
        status: "prereq-pending",
        detail: "Needs MATH 3150 (in progress)",
      },
    ],
  },
]

export const advisorInsight = {
  title: "Stay on track for May 2028",
  body: "Taking CS 3410 in Spring 2027 unlocks CS 4410 Distributed Systems in Fall 2027 — the only term it is offered before your planned graduation.",
}
