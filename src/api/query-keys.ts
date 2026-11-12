import type {
  AcademicRecordsQuery,
  AdminCourseQuery,
  AdminStudentQuery,
  AdminUniversityQuery,
  StudentDocumentType,
} from "@/api/types"

/** Every query key in one place, so invalidations can't drift from the queries they target. */
export const queryKeys = {
  me: ["me"] as const,
  universitySources: ["me", "university-sources"] as const,
  documents: (type?: StudentDocumentType) => ["me", "documents", type ?? "all"] as const,

  academicSummary: ["academics", "summary"] as const,
  academicRecords: (query: AcademicRecordsQuery = {}) => ["academics", "records", query] as const,
  myCourses: ["academics", "courses"] as const,
  course: (id: string) => ["courses", id] as const,
  studyPlan: ["academics", "study-plan"] as const,
  recommendations: ["academics", "recommendations"] as const,

  admin: {
    all: ["admin"] as const,
    stats: (months: number) => ["admin", "stats", months] as const,
    universities: (query: AdminUniversityQuery) => ["admin", "universities", "list", query] as const,
    university: (id: string) => ["admin", "universities", "detail", id] as const,
    majors: (universityId: string) => ["admin", "universities", "majors", universityId] as const,
    courses: (query: AdminCourseQuery) => ["admin", "courses", "list", query] as const,
    students: (query: AdminStudentQuery) => ["admin", "students", "list", query] as const,
    student: (id: string) => ["admin", "students", "detail", id] as const,
  },

  /** Public reference data (countries.dev, Hipo universities) — not tied to the session. */
  directory: {
    countries: ["directory", "countries"] as const,
    cities: (countryCode: string | undefined, query: string) => ["directory", "cities", countryCode, query] as const,
    universitiesIn: (countryCode: string | undefined) => ["directory", "universities", "country", countryCode] as const,
    universitySearch: (query: string) => ["directory", "universities", "search", query] as const,
  },
}

/** Data derived from the student's record and plan; refetched after anything changes them. */
export const academicKeys = ["academics"] as const
