import type {
  CatalogStatus,
  CourseCategory,
  CourseSource,
  DegreeType,
  LetterGrade,
  ProcessingStatus,
  ResourceDifficulty,
  ResourcePlatform,
  StudentCourseStatus,
  StudentDocumentType,
  Term,
  TermRefDto,
} from "@/api/types"

/**
 * Display text for the API's enum values. The API sends Prisma names (`MAJOR_REQUIREMENT`,
 * `A_MINUS`, `FALL`); the UI never shows them raw.
 */

// ── Terms ────────────────────────────────────────────────────────────────────

export const TERM_LABEL: Record<Term, string> = { FALL: "Fall", SPRING: "Spring", SUMMER: "Summer" }

/** Order within a calendar year. */
export const TERM_ORDER: Record<Term, number> = { SPRING: 0, SUMMER: 1, FALL: 2 }

/** "Fall 2026" */
export const termLabel = ({ term, year }: TermRefDto) => `${TERM_LABEL[term]} ${year}`

/** "F26" */
export const termShort = ({ term, year }: TermRefDto) => `${TERM_LABEL[term][0]}${String(year).slice(-2)}`

/** "fall-2026": stable id for anchors and React keys. */
export const termId = ({ term, year }: TermRefDto) => `${term.toLowerCase()}-${year}`

export const compareTerms = (a: TermRefDto, b: TermRefDto) => a.year - b.year || TERM_ORDER[a.term] - TERM_ORDER[b.term]

/** "Fall, Spring" */
export const offeredLabel = (terms: Term[]) =>
  terms.length === 0
    ? "Not scheduled"
    : [...terms]
        .sort((a, b) => TERM_ORDER[a] - TERM_ORDER[b])
        .map((term) => TERM_LABEL[term])
        .join(", ")

/** The month a term's degree is conferred in, for "graduates December 2027". */
const GRADUATION_MONTH: Record<Term, { long: string; short: string }> = {
  SPRING: { long: "May", short: "May" },
  SUMMER: { long: "August", short: "Aug" },
  FALL: { long: "December", short: "Dec" },
}

/** "December 2027", or "Dec 2027" when short. */
export function graduationLabel(ref: TermRefDto, short = false) {
  const month = GRADUATION_MONTH[ref.term]
  return `${short ? month.short : month.long} ${ref.year}`
}

// ── Grades ───────────────────────────────────────────────────────────────────

export const GRADE_LABEL: Record<LetterGrade, string> = {
  A: "A",
  A_MINUS: "A-",
  B_PLUS: "B+",
  B: "B",
  B_MINUS: "B-",
  C_PLUS: "C+",
  C: "C",
  C_MINUS: "C-",
  D_PLUS: "D+",
  D: "D",
  F: "F",
}

export const gradeLabel = (grade: LetterGrade) => GRADE_LABEL[grade]

export const formatGpa = (gpa: number | null | undefined) => (gpa == null ? "—" : gpa.toFixed(2))

// ── Courses ──────────────────────────────────────────────────────────────────

export const COURSE_CATEGORIES: Record<CourseCategory, { label: string; description: string }> = {
  MAJOR_REQUIREMENT: { label: "Major requirement", description: "Required for every student in the major." },
  MAJOR_ELECTIVE: { label: "Major elective", description: "Upper-level electives chosen within the major." },
  MATH_SCIENCE: { label: "Math & science", description: "Mathematics, statistics, and lab science." },
  GENERAL_EDUCATION: { label: "General education", description: "University-wide breadth requirements." },
}

export const CATEGORY_ORDER = Object.keys(COURSE_CATEGORIES) as CourseCategory[]

export const categoryLabel = (category: CourseCategory) => COURSE_CATEGORIES[category].label

export const COURSE_STATUS_LABEL: Record<StudentCourseStatus, string> = {
  NOT_TAKEN: "Not taken",
  IN_PROGRESS: "In progress",
  PLANNED: "Planned",
  COMPLETED: "Completed",
  FAILED: "Failed",
}

export const COURSE_SOURCE_LABEL: Record<CourseSource, string> = {
  CATALOG_IMPORT: "Catalog import",
  AI_EXTRACTED: "AI-captured",
  ADMIN: "Added by admin",
}

export const DEGREE_LABEL: Record<DegreeType, string> = {
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  DOCTORATE: "Doctorate",
  ASSOCIATE: "Associate",
  OTHER: "Other",
}

/** "Bachelor's · Computer Science" */
export const majorLabel = (major: { name: string; degreeType: DegreeType }) =>
  major.degreeType === "OTHER" ? major.name : `${DEGREE_LABEL[major.degreeType]} · ${major.name}`

// ── Catalog and processing ───────────────────────────────────────────────────

export const CATALOG_STATUS_LABEL: Record<CatalogStatus, string> = {
  AVAILABLE: "Catalog available",
  PROCESSING: "Processing",
  UNAVAILABLE: "No catalog",
}

export const PROCESSING_STATUS_LABEL: Record<ProcessingStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Processed",
  FAILED: "Failed",
}

export const DOCUMENT_TYPE_LABEL: Record<StudentDocumentType, string> = {
  TRANSCRIPT: "Transcript",
  DEGREE_AUDIT: "Degree audit",
  PORTAL_SCREENSHOT: "Portal screenshot",
  OTHER: "Other",
}

// ── Learning resources ───────────────────────────────────────────────────────

export const PLATFORMS: Record<ResourcePlatform, { label: string }> = {
  YOUTUBE: { label: "YouTube" },
  UDEMY: { label: "Udemy" },
  COURSERA: { label: "Coursera" },
}

export const PLATFORM_ORDER = Object.keys(PLATFORMS) as ResourcePlatform[]

export const DIFFICULTY_LABEL: Record<ResourceDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}

// ── URL params ───────────────────────────────────────────────────────────────

/** `MAJOR_REQUIREMENT` → `major-requirement`, for readable URLs. */
export const enumToParam = (value: string) => value.toLowerCase().replaceAll("_", "-")

/** `major-requirement` → `MAJOR_REQUIREMENT` when it's one of `allowed`, otherwise null. */
export function paramToEnum<T extends string>(param: string | null, allowed: readonly T[]): T | null {
  if (!param) return null
  const value = param.toUpperCase().replaceAll("-", "_")
  return (allowed as readonly string[]).includes(value) ? (value as T) : null
}
