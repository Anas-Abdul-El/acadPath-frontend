/** Response of `POST /api/me/what-if`. Labels are display strings and courses are referenced by code. */

export type ScenarioKind = "fail" | "grade-change" | "retake" | "add" | "move-earlier" | "drop" | "swap"

export type SemesterLoad = { label: string; courses: string[]; credits: number }

export type PlanChange = {
  kind: "added" | "removed" | "moved" | "retake"
  code: string
  title: string
  from?: string
  to?: string
}

export type ComparisonRow = {
  label: string
  current: string
  scenario: string
  /** Whether the scenario value is better, worse, or no different for the student. */
  effect: "better" | "worse" | "neutral"
}

export type ScenarioAnalysis = {
  status: "ok"
  kind: ScenarioKind
  headline: string
  summary: string
  /** Null when nothing is graded yet; 0 is a real GPA. */
  gpa: { label: string; current: number | null; scenario: number | null }
  credits: { label: string; current: number; scenario: number }
  graduation: { current: string; scenario: string; semestersDelta: number }
  planChanges: PlanChange[]
  semesters: { current: SemesterLoad[]; scenario: SemesterLoad[] }
  comparison: ComparisonRow[]
  warnings: string[]
  assumptions: string[]
}

export type UnclearScenario = {
  status: "unclear"
  message: string
  suggestions: string[]
}

export type ScenarioResult = ScenarioAnalysis | UnclearScenario
