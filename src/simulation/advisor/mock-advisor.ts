/**
 * SIMULATED advisor. Picks a templated answer from keywords in the latest question and fills it
 * with the student's sample record, then streams it word by word like a model would.
 * Nothing is sent anywhere. Replace `mockAdvisor` with a real `AdvisorService`.
 */
import { generatedPlan, expectedGraduation } from "@/mock/academic/semester-plan"
import { currentTerm, studentProfile } from "@/mock/academic/student-record"
import { findCourse, getCourse } from "@/lib/academic/catalog"
import { courseStatus, creditsCompleted, creditsRequired, cumulativeGpa, gradedCourses } from "@/lib/academic/record"
import { GRADE_POINTS } from "@/lib/gpa"
import type { AdvisorService, ChatMessage } from "@/types/advisor"

const THINKING_MS = 650
const WORD_MS = 16

const courseLine = (code: string) => {
  const course = getCourse(code)
  return `**${code}** ${course.title} (${course.credits} cr)`
}

function gpaAnswer() {
  const weakest = [...gradedCourses].sort((a, b) => GRADE_POINTS[a.grade] - GRADE_POINTS[b.grade]).slice(0, 3)
  const strongest = currentTerm.courses.filter((c) => c.standing === "A" || c.standing === "A-")
  const lowest = [...currentTerm.courses].sort((a, b) => GRADE_POINTS[a.standing] - GRADE_POINTS[b.standing])[0]
  return [
    `Your cumulative GPA is **${cumulativeGpa.toFixed(2)}** across ${creditsCompleted} credits, and your last three terms have all been above 3.6 — the trend is working for you.`,
    "The biggest levers from here:",
    `- **Protect this semester.** ${lowest.code} is your lowest current standing (${lowest.standing}). Moving it up one grade step is worth more than any single retake this late in your degree.`,
    `- **Consider one retake.** Your lowest grades are ${weakest.map((c) => `${c.code} (${c.grade})`).join(", ")}. Retaking a 3-credit course from B- to A adds roughly +0.04 to your cumulative GPA.`,
    `- **Keep strong courses strong.** You're tracking ${strongest.map((c) => c.code).join(" and ")} at A-range — staying there anchors this term.`,
    "You can test any of these in **What-If Analysis** to see the exact effect on your GPA and plan.",
  ].join("\n")
}

function nextSemesterAnswer() {
  const next = generatedPlan.futureSemesters[0]
  const credits = next.courses.reduce((sum, code) => sum + getCourse(code).credits, 0)
  return [
    `Your plan for **${next.label}** has ${next.courses.length} courses (${credits} credits):`,
    ...next.courses.map((code) => `- ${courseLine(code)}`),
    `Why this set: ${next.rationale}`,
    `${generatedPlan.notes[1]} Passing it keeps this plan intact.`,
    "Registration opens **Nov 4**. If you'd like a lighter load, PHIL 2210 is the easiest to move to Fall 2027.",
  ].join("\n")
}

function graduationAnswer() {
  const remaining = creditsRequired - creditsCompleted
  return [
    `You're on track to graduate in **${expectedGraduation}**.`,
    `- ${creditsCompleted} of ${creditsRequired} credits completed; ${remaining} remaining, including the ${currentTerm.courses.length} courses you're taking now.`,
    `- ${generatedPlan.futureSemesters.length} semesters left after ${currentTerm.label}: ${generatedPlan.futureSemesters.map((s) => s.label).join(" and ")}.`,
    `- The critical path is **CS 3110 → CS 3410 → CS 4410**. Operating Systems is Spring-only and Distributed Systems is Fall-only, so a delay in either pushes graduation back a semester.`,
  ].join("\n")
}

function prerequisiteAnswer(code: string) {
  const course = getCourse(code)
  const status = courseStatus(code)
  const lines = [`**${code} ${course.title}** — ${course.credits} credits, offered ${course.offered.join(" and ")}.`]
  if (course.prerequisites.length === 0) lines.push("It has no prerequisites.")
  else
    lines.push(
      "Prerequisites:",
      ...course.prerequisites.map((pre) => {
        const s = courseStatus(pre)
        const state =
          s.kind === "completed" ? `completed (${s.grade})` : s.kind === "in-progress" ? "in progress now" : s.kind === "planned" ? `planned for ${s.term}` : "not taken yet"
        return `- ${courseLine(pre)} — ${state}`
      }),
    )
  if (course.corequisites.length) lines.push(`Corequisite: ${course.corequisites.join(", ")} (before or alongside).`)
  lines.push(
    status.kind === "completed"
      ? `You've already completed it with ${status.grade}.`
      : status.kind === "in-progress"
        ? "You're taking it this semester."
        : status.kind === "planned"
          ? `It's in your plan for ${status.term}.`
          : "It isn't in your plan yet — you can test adding it in What-If Analysis.",
  )
  return lines.join("\n")
}

function strugglingAnswer() {
  const lowest = [...currentTerm.courses].sort((a, b) => GRADE_POINTS[a.standing] - GRADE_POINTS[b.standing])[0]
  const course = getCourse(lowest.code)
  return [
    `If a course feels hard, start with **${lowest.code} ${course.title}** — it's your lowest standing (${lowest.standing}) and it ${lowest.code === "MATH 3150" ? "is a prerequisite for two of your Spring courses" : "feeds into later courses in your plan"}.`,
    "A plan for the next two weeks:",
    "- Go to office hours before the next assessment with two specific problems you couldn't solve.",
    `- Rework the last graded assignment — "${lowest.detail}" — until you can do it without notes.`,
    "- Use the course's learning resources for targeted practice rather than re-reading lectures.",
    `If it still isn't improving by week 10, talk to ${studentProfile.advisor} before the withdrawal deadline — a W protects your GPA, though it moves the course to a later semester.`,
  ].join("\n")
}

function electivesAnswer() {
  const options = ["CS 4300", "CS 4700", "CS 3700", "CS 4500"]
  return [
    "You need 12 credits of major electives. You've completed CS 2650 and CS 3300, and your plan includes CS 4820 and CS 4620.",
    "If you want to change one, these fit your record:",
    ...options.map((code) => `- ${courseLine(code)} — ${getCourse(code).description}`),
    "Tell me what kind of work you're aiming for and I can narrow it down.",
  ].join("\n")
}

function fallbackAnswer() {
  return [
    `I can help with your ${studentProfile.program} plan — your GPA, which courses to take, prerequisites, or what happens if something changes.`,
    "For example, try asking:",
    "- How can I improve my GPA?",
    "- Which courses should I take next semester?",
    "- What are the prerequisites for CS 4410?",
    "- Am I on track to graduate?",
  ].join("\n")
}

export function composeMockReply(question: string): string {
  const lower = question.toLowerCase()
  const code = question.match(/\b([A-Za-z]{2,4})[\s-]?(\d{4})\b/)
  const mentioned = code ? findCourse(`${code[1].toUpperCase()} ${code[2]}`) : undefined

  if (mentioned && /prereq|require|need|before|eligible|can i take/.test(lower)) return prerequisiteAnswer(mentioned.code)
  if (/gpa|grade|improve|raise/.test(lower)) return gpaAnswer()
  if (/next semester|next term|spring|register|which courses|what courses|should i take/.test(lower)) return nextSemesterAnswer()
  if (/graduat|on track|finish|degree progress/.test(lower)) return graduationAnswer()
  if (/elective/.test(lower)) return electivesAnswer()
  if (/struggl|hard|difficult|failing|behind|help with/.test(lower)) return strugglingAnswer()
  if (mentioned) return prerequisiteAnswer(mentioned.code)
  return fallbackAnswer()
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer)
      reject(signal.reason)
    })
  })

export const mockAdvisor: AdvisorService = {
  async *streamReply(history: ChatMessage[], signal: AbortSignal) {
    const question = [...history].reverse().find((message) => message.role === "student")?.content ?? ""
    await wait(THINKING_MS, signal)
    const tokens = composeMockReply(question).split(/(\s+)/)
    for (const token of tokens) {
      await wait(WORD_MS, signal)
      yield token
    }
  },
}
