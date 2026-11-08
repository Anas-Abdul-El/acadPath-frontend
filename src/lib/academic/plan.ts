/**
 * Joins the student's academic record with their latest study plan into one
 * semester-by-semester timeline: completed terms, the current term, then the plan.
 */
import type {
  AcademicRecordDto,
  CourseCategory,
  CourseSummaryDto,
  LetterGrade,
  StudyPlanCourseDto,
  StudyPlanDto,
  TermRefDto,
} from "@/api/types"
import { compareTerms, termId, termLabel } from "@/lib/labels"

/**
 * completed — passed with a grade · current — enrolled this semester ·
 * planned — scheduled for next semester · remaining — still required, scheduled later.
 */
export type PlanCourseStatus = "completed" | "current" | "planned" | "remaining"

export type PlanCourse = {
  /** Course id. */
  id: string
  code: string
  name: string
  credits: number
  category: CourseCategory
  status: PlanCourseStatus
  grade?: LetterGrade
  /** Prerequisite codes; only known for courses that come from the plan. */
  prerequisites?: string[]
  /** The plan entry id, for courses that can be skipped or restored. */
  planCourseId?: string
  /** The student took this course out of the plan. */
  skipped?: boolean
}

export type PlanSemester = {
  id: string
  label: string
  term: TermRefDto
  status: PlanCourseStatus
  courses: PlanCourse[]
  /** Credits of the courses that count (skipped ones don't). */
  credits: number
  rationale?: string
}

const sumCredits = (courses: PlanCourse[]) =>
  courses.reduce((sum, course) => (course.skipped ? sum : sum + course.credits), 0)

function semester(
  term: TermRefDto,
  status: PlanCourseStatus,
  courses: PlanCourse[],
  rationale?: string | null,
): PlanSemester {
  return {
    id: termId(term),
    label: termLabel(term),
    term,
    status,
    courses,
    credits: sumCredits(courses),
    rationale: rationale ?? undefined,
  }
}

const fromSummary = (course: CourseSummaryDto) => ({
  id: course.id,
  code: course.code,
  name: course.name,
  credits: course.credits,
  category: course.category,
})

function fromPlanEntry(entry: StudyPlanCourseDto, status: PlanCourseStatus): PlanCourse {
  return {
    ...fromSummary(entry.course),
    status: entry.status === "COMPLETED" ? "completed" : entry.status === "IN_PROGRESS" ? "current" : status,
    prerequisites: entry.course.prerequisites.map((prerequisite) => prerequisite.code),
    planCourseId: entry.id,
    skipped: entry.status === "SKIPPED",
  }
}

/** Groups records by term, oldest first. */
function groupByTerm(records: AcademicRecordDto[]) {
  const groups = new Map<string, { term: TermRefDto; records: AcademicRecordDto[] }>()
  for (const record of records) {
    const term = { term: record.term, year: record.year }
    const key = termId(term)
    const group = groups.get(key) ?? { term, records: [] }
    group.records.push(record)
    groups.set(key, group)
  }
  return [...groups.values()].sort((a, b) => compareTerms(a.term, b.term))
}

/**
 * Failed attempts are left out: they don't count toward the degree, and a retake shows up in its
 * own semester. A plan semester that overlaps a recorded term is dropped in favor of the record.
 */
export function buildPlanTimeline(records: AcademicRecordDto[], plan: StudyPlanDto | null): PlanSemester[] {
  const completed = groupByTerm(records.filter((record) => record.status === "COMPLETED")).map(({ term, records }) =>
    semester(
      term,
      "completed",
      records.map((record) => ({ ...fromSummary(record.course), status: "completed", grade: record.grade ?? undefined })),
    ),
  )

  const current = groupByTerm(records.filter((record) => record.status === "IN_PROGRESS")).map(({ term, records }) =>
    semester(
      term,
      "current",
      records.map((record) => ({ ...fromSummary(record.course), status: "current" })),
    ),
  )

  const recorded = [...completed, ...current]
  const lastRecorded = recorded.reduce<TermRefDto | null>(
    (latest, { term }) => (latest === null || compareTerms(term, latest) > 0 ? term : latest),
    null,
  )

  const future = (plan?.semesters ?? [])
    .filter((entry) => lastRecorded === null || compareTerms(entry, lastRecorded) > 0)
    .sort(compareTerms)
    .map((entry, index) => {
      const status: PlanCourseStatus = index === 0 ? "planned" : "remaining"
      const term = { term: entry.term, year: entry.year }
      return semester(
        term,
        status,
        entry.courses.map((course) => fromPlanEntry(course, status)),
        entry.rationale,
      )
    })

  return [...recorded.sort((a, b) => compareTerms(a.term, b.term)), ...future]
}
