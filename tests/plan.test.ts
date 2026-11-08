import { describe, expect, it } from "vitest"

import type { AcademicRecordDto, CourseDto, StudyPlanDto } from "@/api/types"
import { buildPlanTimeline } from "@/lib/academic/plan"

const course = (code: string, credits = 3, prerequisites: string[] = []): CourseDto => ({
  id: `id-${code}`,
  code,
  name: `Course ${code}`,
  credits,
  category: "MAJOR_REQUIREMENT",
  majorId: "major",
  description: null,
  offeredTerms: ["FALL", "SPRING"],
  prerequisites: prerequisites.map((p) => ({ id: `id-${p}`, code: p, name: `Course ${p}` })),
  corequisites: [],
})

const record = (
  code: string,
  status: AcademicRecordDto["status"],
  term: AcademicRecordDto["term"],
  year: number,
): AcademicRecordDto => ({
  id: `r-${code}-${term}-${year}`,
  course: course(code),
  status,
  grade: status === "COMPLETED" ? "A_MINUS" : status === "FAILED" ? "F" : null,
  expectedGrade: null,
  term,
  year,
})

const plan: StudyPlanDto = {
  id: "plan",
  name: "Study plan",
  generatedAt: "2026-10-14T12:00:00.000Z",
  assumptions: [],
  notes: [],
  semesters: [
    {
      id: "s2",
      term: "FALL",
      year: 2027,
      rationale: null,
      credits: 4,
      courses: [{ id: "pc3", status: "PLANNED", course: course("CS 4410", 4, ["CS 3110"]) }],
    },
    {
      id: "s1",
      term: "SPRING",
      year: 2027,
      rationale: "Clears the systems sequence.",
      credits: 6,
      courses: [
        { id: "pc1", status: "PLANNED", course: course("CS 3110", 3, ["CS 2110"]) },
        { id: "pc2", status: "SKIPPED", course: course("ENGL 2040") },
      ],
    },
    // Overlaps the recorded current term, so the record wins.
    { id: "s0", term: "FALL", year: 2026, rationale: null, credits: 3, courses: [] },
  ],
  totals: { plannedCredits: 10, creditsRequired: 128, meetsDegreeTotal: true },
  expectedGraduation: { term: "FALL", year: 2027 },
}

describe("buildPlanTimeline", () => {
  const records = [
    record("CS 1110", "COMPLETED", "FALL", 2025),
    record("MATH 1910", "FAILED", "FALL", 2025),
    record("CS 2110", "COMPLETED", "SPRING", 2026),
    record("CS 2800", "IN_PROGRESS", "FALL", 2026),
  ]

  it("orders completed terms, the current term, then the plan", () => {
    const timeline = buildPlanTimeline(records, plan)
    expect(timeline.map((s) => [s.label, s.status])).toEqual([
      ["Fall 2025", "completed"],
      ["Spring 2026", "completed"],
      ["Fall 2026", "current"],
      ["Spring 2027", "planned"],
      ["Fall 2027", "remaining"],
    ])
  })

  it("leaves failed attempts out and keeps grades", () => {
    const [fall2025] = buildPlanTimeline(records, plan)
    expect(fall2025.courses.map((c) => c.code)).toEqual(["CS 1110"])
    expect(fall2025.courses[0].grade).toBe("A_MINUS")
  })

  it("keeps skipped courses but doesn't count their credits", () => {
    const spring2027 = buildPlanTimeline(records, plan)[3]
    expect(spring2027.courses.find((c) => c.code === "ENGL 2040")?.skipped).toBe(true)
    expect(spring2027.credits).toBe(3)
    expect(spring2027.rationale).toBe("Clears the systems sequence.")
    expect(spring2027.courses[0]).toMatchObject({ planCourseId: "pc1", prerequisites: ["CS 2110"] })
  })

  it("works without a plan", () => {
    expect(buildPlanTimeline(records, null).map((s) => s.status)).toEqual(["completed", "completed", "current"])
    expect(buildPlanTimeline([], null)).toEqual([])
  })
})
