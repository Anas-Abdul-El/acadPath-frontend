/**
 * Request and response shapes of the AcadPath API (see dto.md). Enums use the backend's
 * Prisma names; `lib/labels.ts` turns them into display text.
 */

// ── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "STUDENT" | "ADMIN"
export type YearOfStudy = "NEW_STUDENT" | "YEAR_1" | "YEAR_2" | "YEAR_3" | "YEAR_4" | "YEAR_5_PLUS"
export type DegreeType = "BACHELOR" | "MASTER" | "DOCTORATE" | "ASSOCIATE" | "OTHER"
export type Term = "FALL" | "SPRING" | "SUMMER"
export type CourseCategory = "MAJOR_REQUIREMENT" | "MAJOR_ELECTIVE" | "MATH_SCIENCE" | "GENERAL_EDUCATION"
export type CourseSource = "CATALOG_IMPORT" | "AI_EXTRACTED" | "ADMIN"
export type LetterGrade =
  | "A"
  | "A_MINUS"
  | "B_PLUS"
  | "B"
  | "B_MINUS"
  | "C_PLUS"
  | "C"
  | "C_MINUS"
  | "D_PLUS"
  | "D"
  | "F"
export type AcademicRecordStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS"
export type PlannedCourseStatus = "PLANNED" | "COMPLETED" | "IN_PROGRESS" | "SKIPPED"
export type SourceType = "HTML" | "PDF" | "IMAGE"
export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
export type StudentDocumentType = "TRANSCRIPT" | "DEGREE_AUDIT" | "PORTAL_SCREENSHOT" | "OTHER"
export type ResourcePlatform = "YOUTUBE" | "UDEMY" | "COURSERA"
export type ResourceDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type StudentCourseStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS" | "PLANNED" | "NOT_TAKEN"
export type CatalogStatus = "AVAILABLE" | "PROCESSING" | "UNAVAILABLE"

// ── Envelopes ────────────────────────────────────────────────────────────────

export type DataEnvelope<T> = { data: T }
export type PageMeta = { page: number; pageSize: number; total: number }
export type Paginated<T> = { data: T[]; meta: PageMeta }
export type PageParams = { page?: number; pageSize?: number; q?: string }

// ── Shared DTOs ──────────────────────────────────────────────────────────────

export type UserDto = { id: string; name: string; email: string; role: UserRole }

export type UniversitySummaryDto = { id: string; name: string; shortName: string | null }

export type UniversityDto = UniversitySummaryDto & {
  country: string
  city: string
  website: string | null
  catalogYear: string | null
}

export type MajorDto = {
  id: string
  universityId: string
  name: string
  degreeType: DegreeType
  totalRequiredCredits: number | null
}

export type CourseRefDto = { id: string; code: string; name: string }

export type CourseSummaryDto = CourseRefDto & { credits: number; category: CourseCategory }

export type CourseDto = CourseSummaryDto & {
  majorId: string
  description: string | null
  offeredTerms: Term[]
  prerequisites: CourseRefDto[]
  corequisites: CourseRefDto[]
}

export type TermRefDto = { term: Term; year: number }

export type LearningResourceDto = {
  id: string
  title: string
  url: string
  platform: ResourcePlatform
  provider: string | null
  format: string | null
  description: string | null
  duration: string | null
  difficulty: ResourceDifficulty | null
  topics: string[]
  verified: boolean
  courses: CourseRefDto[]
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export type SignInRequest = { email: string; password: string }
export type RegisterRequest = { name: string; email: string; password: string }
export type SessionDto = { user: UserDto; accessToken: string }

// ── Current user and onboarding ──────────────────────────────────────────────

export type ProfileDto = {
  university: UniversityDto | null
  major: MajorDto | null
  yearOfStudy: YearOfStudy | null
  onboardingCompletedAt: string | null
}

export type OnboardingDto = {
  universitySelected: boolean
  catalogStatus: CatalogStatus | null
  universityDocumentsUploaded: boolean
  yearOfStudySelected: boolean
  transcriptRequired: boolean
  transcriptUploaded: boolean
  completed: boolean
}

export type MeDto = {
  user: UserDto
  profile: ProfileDto | null
  onboarding: OnboardingDto | null
}

export type UniversitySelectionRequest = { name: string; country: string; city: string; major: string }

export type CatalogSummaryDto = {
  status: CatalogStatus
  title: string | null
  source: string | null
  courseCount: number
  majorCount: number
}

export type UniversitySelectionDto = {
  university: UniversityDto
  major: MajorDto
  catalog: CatalogSummaryDto
  replaced: boolean
}

export type UniversitySourcesUploadDto = Omit<UniversitySelectionDto, "replaced">

export type UniversitySourceDto = {
  id: string
  title: string
  sourceType: SourceType
  status: ProcessingStatus
  errorMessage: string | null
  createdAt: string
}

export type ProfilePatchRequest = { yearOfStudy?: YearOfStudy }

export type StudentDocumentDto = {
  id: string
  type: StudentDocumentType
  fileName: string
  mimeType: string
  fileSize: number
  status: ProcessingStatus
  errorMessage: string | null
  processedAt: string | null
  createdAt: string
}

// ── Student academics ────────────────────────────────────────────────────────

export type AcademicSummaryDto = {
  student: {
    name: string
    university: UniversitySummaryDto
    major: MajorDto
    yearOfStudy: YearOfStudy | null
  }
  gpa: { cumulative: number | null; changeSinceLastYear: number | null }
  credits: { completed: number; inProgress: number; required: number | null; remaining: number | null }
  graduation: { progressPercent: number | null; expected: TermRefDto | null }
  currentTerm:
    | (TermRefDto & {
        credits: number
        courses: { recordId: string; course: CourseSummaryDto; expectedGrade: LetterGrade | null }[]
      })
    | null
  lastTerm:
    | (TermRefDto & {
        gpa: number | null
        courses: { course: CourseSummaryDto; status: AcademicRecordStatus; grade: LetterGrade | null }[]
      })
    | null
  termHistory: (TermRefDto & { gpa: number | null; credits: number })[]
  requirements: { category: CourseCategory; completedCredits: number; plannedCredits: number }[]
}

export type AcademicRecordDto = {
  id: string
  course: CourseSummaryDto
  status: AcademicRecordStatus
  grade: LetterGrade | null
  expectedGrade: LetterGrade | null
  term: Term
  year: number
}

export type AcademicRecordsQuery = { status?: AcademicRecordStatus; term?: Term; year?: number }

export type RequisiteDto = CourseRefDto & { met: boolean }

export type StatusDetailDto = { grade: LetterGrade | null; term: Term | null; year: number | null }

export type MyCourseDto = Omit<CourseDto, "prerequisites" | "corequisites"> & {
  prerequisites: RequisiteDto[]
  corequisites: RequisiteDto[]
  status: StudentCourseStatus
  statusDetail: StatusDetailDto
}

export type CourseDetailDto = CourseDto & {
  requiredFor: CourseRefDto[]
  resources: LearningResourceDto[]
  studentStatus: { status: StudentCourseStatus; statusDetail: StatusDetailDto } | null
}

// ── Study plan ───────────────────────────────────────────────────────────────

export type StudyPlanCourseDto = { id: string; status: PlannedCourseStatus; course: CourseDto }

export type StudyPlanSemesterDto = TermRefDto & {
  id: string
  rationale: string | null
  credits: number
  courses: StudyPlanCourseDto[]
}

export type StudyPlanDto = {
  id: string
  name: string
  generatedAt: string
  assumptions: string[]
  notes: string[]
  semesters: StudyPlanSemesterDto[]
  totals: { plannedCredits: number; creditsRequired: number | null; meetsDegreeTotal: boolean | null }
  expectedGraduation: TermRefDto | null
}

export type GeneratePlanRequest = { maxCreditsPerSemester?: number }

// ── Learning resources and quizzes ───────────────────────────────────────────

export type RecommendationsDto = {
  failed: {
    course: CourseSummaryDto
    why: string
    attempt: TermRefDto & { grade: LetterGrade | null; retakenIn: TermRefDto | null }
    resources: LearningResourceDto[]
  }[]
  difficult: {
    course: CourseSummaryDto
    why: string
    expectedGrade: LetterGrade | null
    resources: LearningResourceDto[]
  }[]
}

export type ResourceSearchRequest = { query: string; goal?: string; platforms: ResourcePlatform[] }
export type ResourceSearchDto = { results: LearningResourceDto[]; matchedCourse: CourseSummaryDto | null }

export type QuizRequest = { resourceId?: string; courseId?: string; count: 5 | 10 | 15 }
export type QuizQuestionDto = {
  id: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}
export type QuizDto = { id: string; topic: string; questions: QuizQuestionDto[] }

// ── Admin ────────────────────────────────────────────────────────────────────

export type AdminStatsDto = {
  counts: { students: number; universities: number; majors: number; courses: number; aiExtractedCourses: number }
  registrationsByMonth: { month: string; count: number }[]
  universitiesByCatalogStatus: Record<CatalogStatus, number>
  sourcesByStatus: Record<ProcessingStatus, number>
}

export type AdminUniversityDto = UniversityDto & {
  createdAt: string
  updatedAt: string
  majorCount: number
  courseCount: number
  studentCount: number
  catalogStatus: CatalogStatus
}

export type AdminMajorDto = MajorDto & { courseCount: number; studentCount: number }

export type AdminSourceDto = {
  id: string
  title: string
  url: string | null
  sourceType: SourceType
  status: ProcessingStatus
  errorMessage: string | null
  lastProcessedAt: string | null
  createdAt: string
}

export type AdminUniversityDetailDto = AdminUniversityDto & { majors: AdminMajorDto[]; sources: AdminSourceDto[] }

export type AdminUniversityQuery = PageParams & { country?: string; catalogStatus?: CatalogStatus }

export type AdminUniversityRequest = {
  name: string
  shortName: string | null
  country: string
  city: string
  website: string | null
  catalogYear: string | null
}

export type AdminMajorRequest = { name: string; degreeType: DegreeType; totalRequiredCredits: number | null }

export type MajorRefDto = { id: string; name: string; degreeType: DegreeType }

export type AdminCourseDto = CourseDto & {
  university: UniversitySummaryDto
  major: MajorRefDto
  source: CourseSource
  updatedAt: string
  updatedBy: { id: string; name: string } | null
}

export type AdminCourseQuery = PageParams & {
  universityId?: string
  majorId?: string
  category?: CourseCategory
  source?: CourseSource
}

export type AdminCourseRequest = {
  majorId: string
  code: string
  name: string
  description: string
  credits: number
  category: CourseCategory
  offeredTerms: Term[]
  prerequisites: string[]
  corequisites: string[]
}

export type StudentStage = "PROCESSED" | "UPLOADED" | "NONE"

export type AdminStudentDto = {
  id: string
  name: string
  email: string
  university: UniversitySummaryDto | null
  major: MajorRefDto | null
  yearOfStudy: YearOfStudy | null
  registeredAt: string
  lastActiveAt: string | null
  stage: StudentStage
  academic: {
    gpa: number | null
    creditsCompleted: number
    creditsRequired: number | null
    expectedGraduation: TermRefDto | null
  } | null
  documents: { transcripts: number }
}

export type AdminStudentDetailDto = AdminStudentDto & {
  onboardingCompletedAt: string | null
  documentsList: { id: string; type: StudentDocumentType; fileName: string; status: ProcessingStatus; createdAt: string }[]
}

export type AdminStudentQuery = PageParams & { universityId?: string; stage?: StudentStage }
