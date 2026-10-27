/**
 * Picks the courses a student needs help with and the resources that match them.
 * Failed courses come from the record's failed attempts; difficult courses are current courses
 * where the student's standing is B+ or lower.
 */
import type { CatalogCourse } from "@/mock/academic/course-catalog"
import { courseCatalog } from "@/mock/academic/course-catalog"
import { currentTerm, failedAttempts } from "@/mock/academic/student-record"
import { resources, type LearningResource } from "@/mock/sources/resources"
import { getCourse } from "@/lib/academic/catalog"
import { courseStatus } from "@/lib/academic/record"
import { GRADE_POINTS } from "@/lib/gpa"

export type FocusCourse = {
  course: CatalogCourse
  /** Why it matters now. */
  why: string
  resources: LearningResource[]
}

const DIFFICULT_AT_OR_BELOW = GRADE_POINTS["B+"]

export const resourcesForCourse = (code: string) => resources.filter((resource) => resource.courseCodes.includes(code))

/** Courses in progress or planned that list `code` as a prerequisite. */
function dependents(code: string) {
  return courseCatalog
    .filter((course) => course.prerequisites.includes(code))
    .filter((course) => ["in-progress", "planned"].includes(courseStatus(course.code).kind))
}

export function failedFocusCourses(): FocusCourse[] {
  return failedAttempts.map((attempt) => {
    const next = dependents(attempt.code)
    return {
      course: getCourse(attempt.code),
      why: next.length
        ? `It's a prerequisite for ${next.map((c) => `${c.code} ${c.title}`).join(" and ")}, so a solid foundation pays off now.`
        : "Refreshing the fundamentals helps with every course that builds on it.",
      resources: resourcesForCourse(attempt.code),
    }
  })
}

export function difficultFocusCourses(): FocusCourse[] {
  return currentTerm.courses
    .filter((course) => GRADE_POINTS[course.standing] <= DIFFICULT_AT_OR_BELOW)
    .sort((a, b) => GRADE_POINTS[a.standing] - GRADE_POINTS[b.standing])
    .map((enrolled) => {
      const next = dependents(enrolled.code)
      return {
        course: getCourse(enrolled.code),
        why: next.length
          ? `You need it for ${next.map((c) => c.code).join(" and ")} next semester.`
          : "Keeping this course on track protects your GPA this semester.",
        resources: resourcesForCourse(enrolled.code),
      }
    })
}
