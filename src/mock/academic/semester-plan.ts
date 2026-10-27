/**
 * Sample AI-generated semester plan. Shaped like the response a planning model would return:
 * per-semester course codes plus a short rationale. Course details are joined from the catalog,
 * and completed/current semesters come from the student record (see `lib/academic/plan.ts`).
 */

export type PlannedSemester = {
  id: string
  label: string
  courses: string[]
  /** Model's one-line reason for this semester's load. */
  rationale: string
}

export type GeneratedPlan = {
  generatedAt: string
  model: string
  /** Assumptions the model made, shown so the student can challenge them. */
  assumptions: string[]
  futureSemesters: PlannedSemester[]
  notes: string[]
}

export const generatedPlan: GeneratedPlan = {
  generatedAt: "Oct 14, 2026",
  model: "AcadPath Planner (sample output)",
  assumptions: [
    "You pass every Fall 2026 course at your current standing.",
    "Course offerings follow the 2023–24 catalog's Fall/Spring pattern.",
    "A maximum of 16 credits per semester.",
  ],
  futureSemesters: [
    {
      id: "spring-2027",
      label: "Spring 2027",
      courses: ["CS 3410", "CS 3600", "CS 4820", "STAT 3300", "PHIL 2210"],
      rationale:
        "Operating Systems and Software Engineering are Spring-only and unlock both Fall 2027 core courses.",
    },
    {
      id: "fall-2027",
      label: "Fall 2027",
      courses: ["CS 4410", "CS 4900", "CS 4620"],
      rationale: "A lighter final semester leaves room for the capstone project and the job search.",
    },
  ],
  notes: [
    "CS 4410 Distributed Systems is only offered in Fall — Fall 2027 is your last chance before graduation.",
    "CS 4820 and STAT 3300 both require MATH 3150, which you're taking now.",
  ],
}

/** Expected graduation if the plan holds. */
export const expectedGraduation = "December 2027"
