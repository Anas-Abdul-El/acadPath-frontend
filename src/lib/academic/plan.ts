/**
 * Joins the AI plan with the student record into one semester-by-semester timeline.
 * Swap `generatedPlan` for a real model response and this stays the same.
 */
import { generatedPlan } from "@/mock/academic/semester-plan";
import { completedTerms, currentTerm } from "@/mock/academic/student-record";
import type { CatalogCourse } from "@/mock/academic/course-catalog";
import { getCourse } from "@/lib/academic/catalog";
import type { LetterGrade } from "@/lib/gpa";

/**
 * completed — passed with a grade · current — enrolled this semester ·
 * planned — scheduled for next semester · remaining — still required, scheduled later.
 */
export type PlanCourseStatus =
  | "completed"
  | "current"
  | "planned"
  | "remaining";

export type PlanCourse = CatalogCourse & {
  status: PlanCourseStatus;
  grade?: LetterGrade;
};

export type PlanSemester = {
  id: string;
  label: string;
  status: PlanCourseStatus;
  courses: PlanCourse[];
  credits: number;
  rationale?: string;
};

const withCredits = (
  semester: Omit<PlanSemester, "credits">,
): PlanSemester => ({
  ...semester,
  credits: semester.courses.reduce((sum, course) => sum + course.credits, 0),
});

export function buildPlanTimeline(): PlanSemester[] {
  const past = completedTerms.map((term) =>
    withCredits({
      id: term.id,
      label: term.label,
      status: "completed",
      courses: term.courses.map((c) => ({
        ...getCourse(c.code),
        status: "completed",
        grade: c.grade,
      })),
    }),
  );

  const current = withCredits({
    id: currentTerm.id,
    label: currentTerm.label,
    status: "current",
    courses: currentTerm.courses.map((c) => ({
      ...getCourse(c.code),
      status: "current",
    })),
  });

  const future = generatedPlan.futureSemesters.map((semester, index) => {
    const status = index === 0 ? "planned" : "remaining";
    return withCredits({
      id: semester.id,
      label: semester.label,
      status,
      rationale: semester.rationale,
      courses: semester.courses.map((code) => ({ ...getCourse(code), status })),
    });
  });
  return [...past, current, ...future];
}
