/** Standard 4.0 grade-point scale. */
export const GRADE_POINTS = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
} as const;

export type LetterGrade = keyof typeof GRADE_POINTS;

/** Cumulative GPA after adding one course with the given grade. */
export const projectGpa = (
  currentGpa: number,
  currentCredits: number,
  courseCredits: number,
  grade: LetterGrade,
) => {
  const qualityPoints =
    currentGpa * currentCredits + GRADE_POINTS[grade] * courseCredits;
  return qualityPoints / (currentCredits + courseCredits);
};

export const LETTER_GRADES = Object.keys(GRADE_POINTS) as LetterGrade[];

/** Credit-weighted GPA for a list of graded courses (0 when there are no credits). */
export const weightedGpa = (
  courses: { credits: number; grade: LetterGrade }[],
) => {
  const credits = courses.reduce((sum, course) => sum + course.credits, 0);
  if (credits === 0) return 0;
  return (
    courses.reduce(
      (sum, course) => sum + GRADE_POINTS[course.grade] * course.credits,
      0,
    ) / credits
  );
};
