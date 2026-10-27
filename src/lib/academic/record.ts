/**
 * Values derived from the student record + catalog: GPA, credits, requirement progress,
 * and per-course status. Pages read these instead of re-computing them.
 */
import {
  catalogInfo,
  COURSE_CATEGORIES,
  type CourseCategory,
} from "@/mock/academic/course-catalog";
import { generatedPlan } from "@/mock/academic/semester-plan";
import { completedTerms, currentTerm } from "@/mock/academic/student-record";
import type { RequirementGroup, TermGpa } from "@/mock/student-preview";
import { getCourse } from "@/lib/academic/catalog";
import { weightedGpa, type LetterGrade } from "@/lib/gpa";

export type GradedCourse = {
  code: string;
  credits: number;
  grade: LetterGrade;
  term: string;
};

export const gradedCourses: GradedCourse[] = completedTerms.flatMap((term) =>
  term.courses.map((course) => ({
    ...course,
    credits: getCourse(course.code).credits,
    term: term.label,
  })),
);

export const termGpaHistory: TermGpa[] = completedTerms.map((term) => {
  const courses = gradedCourses.filter((course) => course.term === term.label);
  return {
    term: term.label,
    shortTerm: term.shortLabel,
    gpa: Math.round(weightedGpa(courses) * 100) / 100,
    credits: courses.reduce((sum, course) => sum + course.credits, 0),
  };
});

export const cumulativeGpa = weightedGpa(gradedCourses);

/** Change versus the cumulative GPA one academic year (two terms) ago. */
export const gpaChangeOverYear =
  cumulativeGpa -
  weightedGpa(
    gradedCourses.filter(
      (course) =>
        !completedTerms.slice(-2).some((t) => t.label === course.term),
    ),
  );

export const creditsCompleted = gradedCourses.reduce(
  (sum, course) => sum + course.credits,
  0,
);
export const creditsRequired = catalogInfo.creditsRequired;
export const currentTermCredits = currentTerm.courses.reduce(
  (sum, course) => sum + getCourse(course.code).credits,
  0,
);
export const graduationPercent = Math.round(
  (creditsCompleted / creditsRequired) * 100,
);

const plannedCodes = generatedPlan.futureSemesters.flatMap(
  (semester) => semester.courses,
);
const degreeCodes = [
  ...gradedCourses.map((course) => course.code),
  ...currentTerm.courses.map((course) => course.code),
  ...plannedCodes,
];

/** Completed vs required credits per catalog category, using the full degree plan as "required". */
export const requirementGroups: RequirementGroup[] = (
  Object.keys(COURSE_CATEGORIES) as CourseCategory[]
).map((category) => {
  const inCategory = (code: string) => getCourse(code).category === category;
  return {
    name: COURSE_CATEGORIES[category].label,
    completed: gradedCourses
      .filter((c) => inCategory(c.code))
      .reduce((sum, c) => sum + c.credits, 0),
    required: degreeCodes
      .filter(inCategory)
      .reduce((sum, code) => sum + getCourse(code).credits, 0),
  };
});

export type StudentCourseStatus =
  | { kind: "completed"; grade: LetterGrade; term: string }
  | { kind: "in-progress"; term: string }
  | { kind: "planned"; term: string }
  | { kind: "not-taken" };

const statusByCode = new Map<string, StudentCourseStatus>();
for (const course of gradedCourses)
  statusByCode.set(course.code, {
    kind: "completed",
    grade: course.grade,
    term: course.term,
  });
for (const course of currentTerm.courses)
  statusByCode.set(course.code, {
    kind: "in-progress",
    term: currentTerm.label,
  });
for (const semester of generatedPlan.futureSemesters)
  for (const code of semester.courses)
    statusByCode.set(code, { kind: "planned", term: semester.label });

export function courseStatus(code: string): StudentCourseStatus {
  return statusByCode.get(code) ?? { kind: "not-taken" };
}

/** Prerequisites not yet passed — split into those in progress now and those not started. */
export function prerequisiteGaps(code: string) {
  const missing = getCourse(code).prerequisites.filter(
    (pre) => courseStatus(pre).kind !== "completed",
  );
  return {
    inProgress: missing.filter(
      (pre) => courseStatus(pre).kind === "in-progress",
    ),
    outstanding: missing.filter(
      (pre) => courseStatus(pre).kind !== "in-progress",
    ),
  };
}
