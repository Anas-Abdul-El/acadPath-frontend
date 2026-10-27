/**
 * SIMULATED What-If analysis. A keyword parser reads the scenario, then deterministic rules
 * recompute GPA and reschedule the remaining plan against catalog prerequisites, offering terms,
 * and credit limits. Replace `analyzeScenario` with a call to the real AI service — the page only
 * depends on its signature and the `ScenarioResult` type.
 */
import { courseCatalog, type CatalogCourse } from "@/mock/academic/course-catalog"
import { generatedPlan } from "@/mock/academic/semester-plan"
import { currentTerm } from "@/mock/academic/student-record"
import { findCourse, getCourse } from "@/lib/academic/catalog"
import { courseStatus, creditsCompleted, gradedCourses } from "@/lib/academic/record"
import { weightedGpa, type LetterGrade } from "@/lib/gpa"
import type {
  ComparisonRow,
  PlanChange,
  ScenarioKind,
  ScenarioResult,
  SemesterLoad,
} from "@/types/what-if"

const DEFAULT_EXPECTED_GRADE: LetterGrade = "B+"
const STANDARD_MAX_CREDITS = 16
const OVERLOAD_LIMIT = 18
const SIMULATED_LATENCY_MS = 1300

// ── Parsing ──────────────────────────────────────────────────────────────────

type ParsedScenario = {
  kind: ScenarioKind | null
  /** Courses in the order they appear in the text. */
  courses: CatalogCourse[]
  grade: LetterGrade | null
}

const CODE_PATTERN = /\b([A-Za-z]{2,4})[\s-]?(\d{4})\b/g
const GRADE_PATTERN = /\b(?:get|gets|getting|got|earn|earning|score|scoring|receive|with|of|an|a)\s+(?:an?\s+)?([ABCDF][+-]?)(?![A-Za-z])/

/** Distinctive phrase for each course, e.g. "operating systems" for "Operating Systems". */
const titleAlias = (course: CatalogCourse) => course.title.split(/[&:]/)[0].trim().toLowerCase()

function findCourses(text: string): CatalogCourse[] {
  const found: { course: CatalogCourse; index: number }[] = []
  for (const match of text.matchAll(CODE_PATTERN)) {
    const course = findCourse(`${match[1].toUpperCase()} ${match[2]}`)
    if (course) found.push({ course, index: match.index ?? 0 })
  }
  const lower = text.toLowerCase()
  for (const course of courseCatalog) {
    const index = lower.indexOf(titleAlias(course))
    if (index >= 0 && !found.some((f) => f.course.code === course.code)) found.push({ course, index })
  }
  return found.sort((a, b) => a.index - b.index).map((f) => f.course)
}

function parseScenario(text: string): ParsedScenario {
  const lower = text.toLowerCase()
  const grade = (text.match(GRADE_PATTERN)?.[1] as LetterGrade | undefined) ?? null
  const kind: ScenarioKind | null = /\b(retake|re-take|repeat|redo)\b/.test(lower)
    ? "retake"
    : /\b(fail|fails|failing|failed|flunk)\b/.test(lower) || grade === "F"
      ? "fail"
      : /\b(drop|withdraw|withdrawing|dropping)\b/.test(lower)
        ? "drop"
        : /\b(instead of|replace|swap|switch|change)\b/.test(lower)
          ? "swap"
          : /\b(add|additional|extra|another|one more|overload)\b/.test(lower)
            ? "add"
            : grade
              ? "grade-change"
              : /\btake\b/.test(lower)
                ? "add"
                : null
  return { kind, courses: findCourses(text), grade }
}

// ── Scheduling ───────────────────────────────────────────────────────────────

/** Semester labels after the current term: Spring 2027, Fall 2027, Spring 2028, … */
function semesterLabel(index: number) {
  const year = 2027 + Math.floor(index / 2)
  return `${index % 2 === 0 ? "Spring" : "Fall"} ${year}`
}
const seasonOf = (index: number) => (index % 2 === 0 ? "Spring" : "Fall")
const graduationOf = (label: string) =>
  label.startsWith("Spring") ? `May ${label.split(" ")[1]}` : `December ${label.split(" ")[1]}`

type Pending = { code: string; earliest: number; priority?: boolean }

const loadOf = (label: string, courses: string[]): SemesterLoad => ({
  label,
  courses,
  credits: courses.reduce((sum, code) => sum + getCourse(code).credits, 0),
})

/**
 * Greedy scheduler: each semester takes eligible courses (prerequisites done in an earlier term,
 * offered that season, not before their original semester) until the credit cap.
 */
function schedule(pending: Pending[], doneBefore: Set<string>, caps: Record<number, number> = {}) {
  const remaining = [...pending]
  const done = new Set(doneBefore)
  const semesters: SemesterLoad[] = []

  for (let index = 0; index < 8 && remaining.length > 0; index++) {
    const cap = caps[index] ?? STANDARD_MAX_CREDITS
    const eligible = remaining
      .filter((item) => item.earliest <= index)
      .filter((item) => getCourse(item.code).offered.includes(seasonOf(index)))
      .filter((item) => getCourse(item.code).prerequisites.every((pre) => done.has(pre)))
      .sort((a, b) => Number(Boolean(b.priority)) - Number(Boolean(a.priority)) || a.earliest - b.earliest)

    const chosen: string[] = []
    let credits = 0
    for (const item of eligible) {
      const itemCredits = getCourse(item.code).credits
      if (credits + itemCredits > cap) continue
      chosen.push(item.code)
      credits += itemCredits
    }
    for (const code of chosen) remaining.splice(remaining.findIndex((item) => item.code === code), 1)
    chosen.forEach((code) => done.add(code))
    semesters.push(loadOf(semesterLabel(index), chosen))
  }

  // Trim trailing empty semesters; leftovers mean the plan can't be completed as described.
  while (semesters.length > 0 && semesters[semesters.length - 1].courses.length === 0) semesters.pop()
  return { semesters, unscheduled: remaining.map((item) => item.code) }
}

const baselineSemesters: SemesterLoad[] = generatedPlan.futureSemesters.map((s) => loadOf(s.label, s.courses))
const baselinePending: Pending[] = generatedPlan.futureSemesters.flatMap((semester, index) =>
  semester.courses.map((code) => ({ code, earliest: index })),
)
const completedCodes = gradedCourses.map((course) => course.code)
const currentCodes = currentTerm.courses.map((course) => course.code)

// ── Metrics ──────────────────────────────────────────────────────────────────

type GradedEntry = { code: string; credits: number; grade: LetterGrade }

const baseGraded: GradedEntry[] = [
  ...gradedCourses.map(({ code, credits, grade }) => ({ code, credits, grade })),
  ...currentTerm.courses.map((course) => ({
    code: course.code,
    credits: getCourse(course.code).credits,
    grade: course.standing as LetterGrade,
  })),
]

const round2 = (value: number) => Math.round(value * 100) / 100
const totalCredits = (semesters: SemesterLoad[]) => semesters.reduce((sum, s) => sum + s.credits, 0)

function diffPlans(
  before: SemesterLoad[],
  after: SemesterLoad[],
  retakes: string[],
  carriedOver: string[],
): PlanChange[] {
  const where = (plan: SemesterLoad[]) => new Map(plan.flatMap((s) => s.courses.map((code) => [code, s.label] as const)))
  const from = where(before)
  const to = where(after)
  const changes: PlanChange[] = []
  for (const [code, label] of to) {
    const title = getCourse(code).title
    if (retakes.includes(code)) changes.push({ kind: "retake", code, title, to: label })
    else if (carriedOver.includes(code)) changes.push({ kind: "moved", code, title, from: currentTerm.label, to: label })
    else if (!from.has(code)) changes.push({ kind: "added", code, title, to: label })
    else if (from.get(code) !== label) changes.push({ kind: "moved", code, title, from: from.get(code), to: label })
  }
  for (const [code, label] of from)
    if (!to.has(code)) changes.push({ kind: "removed", code, title: getCourse(code).title, from: label })
  return changes
}

type Outcome = {
  kind: ScenarioKind
  headline: string
  summary: string
  graded: GradedEntry[]
  gpaLabel: string
  earnedThisTerm: number
  semesters: SemesterLoad[]
  retakes?: string[]
  /** Current-term courses pushed to a later semester (e.g. after a withdrawal). */
  carriedOver?: string[]
  warnings?: string[]
  assumptions?: string[]
}

function buildAnalysis(outcome: Outcome): ScenarioResult {
  const baselineGpa = round2(weightedGpa(baseGraded))
  const scenarioGpa = round2(weightedGpa(outcome.graded))
  const baselineEarned = creditsCompleted + currentTerm.courses.reduce((s, c) => s + getCourse(c.code).credits, 0)
  const scenarioEarned = creditsCompleted + outcome.earnedThisTerm
  const lastBaseline = baselineSemesters[baselineSemesters.length - 1].label
  const lastScenario = outcome.semesters[outcome.semesters.length - 1]?.label ?? lastBaseline
  const semestersDelta = outcome.semesters.length - baselineSemesters.length
  const nextLoad = (plan: SemesterLoad[]) => plan.find((s) => s.label === baselineSemesters[0].label)?.credits ?? 0

  const compare = (
    label: string,
    current: number,
    scenario: number,
    higherIsBetter: boolean | null,
    format: (value: number) => string = String,
  ): ComparisonRow => ({
    label,
    current: format(current),
    scenario: format(scenario),
    effect:
      current === scenario || higherIsBetter === null
        ? "neutral"
        : (scenario > current) === higherIsBetter
          ? "better"
          : "worse",
  })

  const comparison: ComparisonRow[] = [
    compare(outcome.gpaLabel, baselineGpa, scenarioGpa, true, (v) => v.toFixed(2)),
    compare(`Credits earned by end of ${currentTerm.label}`, baselineEarned, scenarioEarned, true),
    compare(`${baselineSemesters[0].label} credit load`, nextLoad(baselineSemesters), nextLoad(outcome.semesters), null),
    compare("Semesters remaining after this one", baselineSemesters.length, outcome.semesters.length, false),
    compare(
      "Total degree credits",
      baselineEarned + totalCredits(baselineSemesters),
      scenarioEarned + totalCredits(outcome.semesters),
      null,
    ),
    {
      label: "Expected graduation",
      current: graduationOf(lastBaseline),
      scenario: graduationOf(lastScenario),
      effect: semestersDelta > 0 ? "worse" : semestersDelta < 0 ? "better" : "neutral",
    },
  ]

  const warnings = [...(outcome.warnings ?? [])]
  for (const semester of outcome.semesters)
    if (semester.credits > OVERLOAD_LIMIT)
      warnings.push(`${semester.label} would be ${semester.credits} credits — above the ${OVERLOAD_LIMIT}-credit limit, so it needs your advisor's approval.`)

  return {
    status: "ok",
    kind: outcome.kind,
    headline: outcome.headline,
    summary: outcome.summary,
    gpa: { label: outcome.gpaLabel, current: baselineGpa, scenario: scenarioGpa },
    credits: { label: `Credits earned by end of ${currentTerm.label}`, current: baselineEarned, scenario: scenarioEarned },
    graduation: { current: graduationOf(lastBaseline), scenario: graduationOf(lastScenario), semestersDelta },
    planChanges: diffPlans(baselineSemesters, outcome.semesters, outcome.retakes ?? [], outcome.carriedOver ?? []),
    semesters: { current: baselineSemesters, scenario: outcome.semesters },
    comparison,
    warnings,
    assumptions: [
      `Your other ${currentTerm.label} courses finish at their current standing.`,
      "Courses follow the catalog's Fall/Spring offering pattern, up to 16 credits per semester.",
      ...(outcome.assumptions ?? []),
    ],
  }
}

// ── Scenario handlers ────────────────────────────────────────────────────────

const currentCredits = currentTerm.courses.reduce((s, c) => s + getCourse(c.code).credits, 0)
const plannedIndex = (code: string) => generatedPlan.futureSemesters.findIndex((s) => s.courses.includes(code))

function failOrDrop(course: CatalogCourse, kind: "fail" | "drop"): ScenarioResult {
  const status = courseStatus(course.code)
  if (status.kind === "completed")
    return unclear(
      `You already passed ${course.code} with ${status.grade} in ${status.term}. Did you mean retaking it for a better grade?`,
      [`What if I retake ${course.code} and get an A?`],
    )
  if (status.kind === "not-taken")
    return unclear(`${course.code} isn't in your current semester or your plan, so there's nothing to ${kind}.`, [
      `What if I add ${course.code} next semester?`,
    ])

  const verb = kind === "fail" ? "fail" : "drop"
  if (status.kind === "in-progress") {
    const done = new Set([...completedCodes, ...currentCodes.filter((code) => code !== course.code)])
    const { semesters, unscheduled } = schedule(
      [...baselinePending, { code: course.code, earliest: 0, priority: true }],
      done,
    )
    const graded =
      kind === "fail"
        ? baseGraded.map((g) => (g.code === course.code ? { ...g, grade: "F" as LetterGrade } : g))
        : baseGraded.filter((g) => g.code !== course.code)
    const delay = semesters.length - baselineSemesters.length
    return buildAnalysis({
      kind,
      headline:
        delay > 0
          ? `Graduation moves ${delay === 1 ? "one semester" : `${delay} semesters`} later`
          : "Your graduation date holds",
      summary:
        kind === "fail"
          ? `An F in ${course.code} counts toward your GPA this term, and the course has to be retaken. Courses that list it as a prerequisite shift with it.`
          : `Withdrawing from ${course.code} leaves a W (no GPA effect), but its ${course.credits} credits move to a later semester along with any course that requires it.`,
      graded,
      gpaLabel: `Projected GPA after ${currentTerm.label}`,
      earnedThisTerm: currentCredits - course.credits,
      semesters,
      retakes: kind === "fail" ? [course.code] : [],
      carriedOver: kind === "drop" ? [course.code] : [],
      warnings: unscheduled.length ? [`Couldn't fit ${unscheduled.join(", ")} within four years of planning.`] : [],
      assumptions:
        kind === "fail"
          ? [`The retake replaces the F under the grade-replacement policy once you pass (not reflected above).`]
          : [`You withdraw before the deadline, so the course shows as W rather than F.`],
    })
  }

  // Planned course failed in a future semester.
  const index = plannedIndex(course.code)
  const failedLabel = generatedPlan.futureSemesters[index].label
  const done = new Set([...completedCodes, ...currentCodes])
  const before = baselinePending.filter((p) => p.earliest < index)
  const after = baselinePending.filter((p) => p.earliest >= index && p.code !== course.code)
  const firstPart = schedule(before.concat(baselinePending.filter((p) => p.earliest === index && p.code !== course.code)), done)
  firstPart.semesters.forEach((s) => s.courses.forEach((code) => done.add(code)))
  const retake = schedule(
    [...after.filter((p) => !firstPart.semesters.some((s) => s.courses.includes(p.code))), { code: course.code, earliest: index + 1, priority: true }],
    done,
  )
  const semesters = mergeSchedules(firstPart.semesters, retake.semesters)
  return buildAnalysis({
    kind,
    headline:
      semesters.length > baselineSemesters.length ? `Graduation moves to ${graduationOf(semesters.at(-1)!.label)}` : "Your graduation date holds",
    summary: `If you ${verb} ${course.code} in ${failedLabel}, you'd retake it in the next semester it's offered, and anything that needs it waits until then.`,
    graded: kind === "fail" ? [...baseGraded, { code: course.code, credits: course.credits, grade: "F" }] : baseGraded,
    gpaLabel: kind === "fail" ? `Projected GPA after ${failedLabel}` : "Projected cumulative GPA",
    earnedThisTerm: currentCredits,
    semesters,
    retakes: [course.code],
  })
}

/** Combines two partial schedules that both start at Spring 2027. */
function mergeSchedules(a: SemesterLoad[], b: SemesterLoad[]) {
  const length = Math.max(a.length, b.length)
  return Array.from({ length }, (_, i) => loadOf(semesterLabel(i), [...(a[i]?.courses ?? []), ...(b[i]?.courses ?? [])])).filter(
    (s, i, all) => s.courses.length > 0 || all.slice(i).some((later) => later.courses.length > 0),
  )
}

function changeGrade(course: CatalogCourse, grade: LetterGrade): ScenarioResult {
  const status = courseStatus(course.code)
  if (status.kind !== "in-progress")
    return status.kind === "completed"
      ? retake(course, grade)
      : unclear(`${course.code} isn't one of your ${currentTerm.label} courses. Try a course you're taking now.`, [
          `What if I get an A in ${currentCodes[0]}?`,
        ])
  const standing = currentTerm.courses.find((c) => c.code === course.code)?.standing
  return buildAnalysis({
    kind: "grade-change",
    headline: `${grade} in ${course.code} ${grade === standing ? "matches your current standing" : "changes your GPA"}`,
    summary: `You're currently tracking ${standing} in ${course.code}. Finishing with ${grade} only affects this term's GPA — your plan and graduation date stay the same.`,
    graded: baseGraded.map((g) => (g.code === course.code ? { ...g, grade } : g)),
    gpaLabel: `Projected GPA after ${currentTerm.label}`,
    earnedThisTerm: grade === "F" ? currentCredits - course.credits : currentCredits,
    semesters: baselineSemesters,
  })
}

function retake(course: CatalogCourse, grade: LetterGrade | null): ScenarioResult {
  const status = courseStatus(course.code)
  if (status.kind !== "completed")
    return unclear(`You haven't completed ${course.code} yet, so there's no grade to replace.`, [
      `What if I get an A in ${course.code}?`,
    ])
  const newGrade = grade ?? "A"
  const done = new Set([...completedCodes, ...currentCodes])
  const { semesters } = schedule([...baselinePending, { code: course.code, earliest: 0 }], done)
  return buildAnalysis({
    kind: "retake",
    headline: `Retaking ${course.code} for ${newGrade}`,
    summary: `Your ${status.grade} from ${status.term} would be replaced by ${newGrade}. The retake adds ${course.credits} credits of workload but no new degree credit.`,
    graded: baseGraded.map((g) => (g.code === course.code ? { ...g, grade: newGrade } : g)),
    gpaLabel: "Projected cumulative GPA",
    earnedThisTerm: currentCredits,
    semesters,
    retakes: [course.code],
    assumptions: [
      "Northfield replaces the original grade with the retake grade (sample grade-replacement policy).",
      ...(grade ? [] : ["No grade was mentioned, so an A is assumed for the retake."]),
    ],
  })
}

function addCourse(course: CatalogCourse | null, grade: LetterGrade | null): ScenarioResult {
  const target =
    course ??
    courseCatalog.find(
      (c) =>
        c.category === "major-elective" &&
        courseStatus(c.code).kind === "not-taken" &&
        c.offered.includes("Spring") &&
        c.prerequisites.every((pre) => ["completed", "in-progress"].includes(courseStatus(pre).kind)),
    )!
  const status = courseStatus(target.code)
  const expected = grade ?? DEFAULT_EXPECTED_GRADE
  const next = baselineSemesters[0]

  if (status.kind === "completed" || status.kind === "in-progress")
    return unclear(`${target.code} is already ${status.kind === "completed" ? "completed" : "in progress"} this term.`, [
      `What if I add ${courseCatalog.find((c) => c.category === "major-elective" && courseStatus(c.code).kind === "not-taken")?.code} next semester?`,
    ])
  if (!target.offered.includes("Spring"))
    return unclear(
      `${target.code} is only offered in ${target.offered.join(" and ")}, so it can't be added to ${next.label}${status.kind === "planned" ? ` — it stays in ${status.term}` : ""}.`,
      ["What if I take an additional course next semester?"],
    )
  const outstanding = target.prerequisites.filter((pre) => !["completed", "in-progress"].includes(courseStatus(pre).kind))
  if (outstanding.length > 0)
    return unclear(
      `${target.code} needs ${outstanding.join(" and ")} first, which you won't have finished by ${next.label}.`,
      [`What if I add ${outstanding[0]} next semester?`],
    )

  const moving = status.kind === "planned"
  const semesters = baselineSemesters.map((s, i) => {
    const courses = s.courses.filter((code) => code !== target.code)
    return loadOf(s.label, i === 0 ? [...courses, target.code] : courses)
  }).filter((s) => s.courses.length > 0)

  const assumptions = [`You earn ${expected} in ${target.code}${grade ? "" : " (a typical expected grade)"}.`]
  if (!course) assumptions.unshift(`No course was named, so ${target.code} ${target.title} is used as an example elective you're eligible for.`)

  return buildAnalysis({
    kind: moving ? "move-earlier" : "add",
    headline: moving ? `Taking ${target.code} a semester early` : `Adding ${target.code} to ${next.label}`,
    summary: moving
      ? `${target.code} moves from ${status.term} to ${next.label}, lightening your later semester${semesters.length < baselineSemesters.length ? " and finishing your degree sooner" : ""}.`
      : `${target.code} ${target.title} adds ${target.credits} credits to ${next.label}. ${target.category === "major-elective" ? "It counts toward your major electives, so it could replace a later elective." : "It counts as an extra course beyond your plan."}`,
    graded: [...baseGraded, { code: target.code, credits: target.credits, grade: expected }],
    gpaLabel: "Projected cumulative GPA",
    earnedThisTerm: currentCredits,
    semesters,
    assumptions,
  })
}

function swapCourses(courses: CatalogCourse[], text: string): ScenarioResult {
  if (courses.length < 2)
    return unclear("To compare a change, name the course you'd remove and the one you'd take instead.", [
      "What if I take CS 4300 instead of CS 4820?",
      "What if I replace CS 4620 with CS 4700?",
    ])
  // "take B instead of A" → remove A; "replace A with B" / "swap A for B" → remove A.
  const lower = text.toLowerCase()
  const insteadOf = lower.indexOf("instead of")
  const [removed, added] =
    insteadOf >= 0 && lower.indexOf(titleOrCode(courses[0], lower)) < insteadOf
      ? [courses[1], courses[0]]
      : [courses[0], courses[1]]

  const removedStatus = courseStatus(removed.code)
  if (removedStatus.kind !== "planned")
    return unclear(`${removed.code} isn't in your upcoming plan, so it can't be swapped out.`, [
      `What if I take ${added.code} instead of ${generatedPlan.futureSemesters[0].courses[2]}?`,
    ])
  if (courseStatus(added.code).kind !== "not-taken")
    return unclear(`${added.code} is already in your record or plan.`, ["What if I take CS 4300 instead of CS 4820?"])

  const warnings: string[] = []
  if (removed.category === "major-requirement")
    warnings.push(`${removed.code} is a major requirement — removing it leaves your degree incomplete.`)
  if (added.category !== removed.category)
    warnings.push(`${added.code} counts as ${added.category.replace("-", " ")}, not ${removed.category.replace("-", " ")}, so the requirement ${removed.code} fills stays open.`)

  const index = plannedIndex(removed.code)
  const done = new Set([...completedCodes, ...currentCodes])
  const pending = baselinePending.filter((p) => p.code !== removed.code).concat({ code: added.code, earliest: index })
  const { semesters, unscheduled } = schedule(pending, done)
  if (unscheduled.length) warnings.push(`Couldn't schedule ${unscheduled.join(", ")} — check prerequisites and offering terms.`)

  return buildAnalysis({
    kind: "swap",
    headline: `${added.code} replaces ${removed.code}`,
    summary: `${added.code} ${added.title} takes the place of ${removed.code} ${removed.title}. The scheduler places it in the first semester where its prerequisites are met and it's offered.`,
    graded: baseGraded,
    gpaLabel: "Projected cumulative GPA",
    earnedThisTerm: currentCredits,
    semesters,
    warnings,
    assumptions: ["Both courses are assumed to earn the same grade, so GPA is unchanged."],
  })
}

const titleOrCode = (course: CatalogCourse, lower: string) =>
  lower.includes(course.code.toLowerCase()) ? course.code.toLowerCase() : titleAlias(course)

function unclear(message: string, suggestions: string[]): ScenarioResult {
  return { status: "unclear", message, suggestions }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export function analyzeScenarioSync(text: string): ScenarioResult {
  const { kind, courses, grade } = parseScenario(text)
  const [first] = courses

  if (!kind)
    return unclear("I couldn't tell what you'd like to change. Try describing one change to one course.", [
      "What if I fail CS 3110?",
      "What if I retake MATH 2310 and get an A?",
      "What if I take an additional course next semester?",
    ])
  if (kind === "add") return addCourse(first ?? null, grade)
  if (kind === "swap") return swapCourses(courses, text)
  if (!first)
    return unclear("Which course do you mean? Mention its code (like CS 3110) or its name.", [
      `What if I ${kind === "retake" ? "retake MATH 2310 and get an A" : kind === "drop" ? "drop ENGL 2040" : "fail CS 3110"}?`,
    ])
  if (kind === "fail" || kind === "drop") return failOrDrop(first, kind)
  if (kind === "retake") return retake(first, grade)
  return changeGrade(first, grade ?? DEFAULT_EXPECTED_GRADE)
}

/** Async boundary the UI calls — the same shape a network request to an AI service would have. */
export async function analyzeScenario(text: string, signal?: AbortSignal): Promise<ScenarioResult> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, SIMULATED_LATENCY_MS)
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer)
      reject(signal.reason)
    })
  })
  return analyzeScenarioSync(text)
}
