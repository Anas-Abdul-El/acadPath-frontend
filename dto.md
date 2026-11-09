# AcadPath API Contract

The routes the backend (`acadPath-backend`) exposes, with their request and response shapes, as implemented today.

This file mirrors the backend code. When the two disagree, the backend is right and this file should be updated. The shapes come from:

- the routes in `src/routes/*.route.ts`
- the request validation in `src/schemas/*.schema.ts`
- the response types in `src/types/*.dto.d.ts`
- the behavior and error messages in `src/services/**`
- the error format in `src/middlewares/errorHandler.ts` and `src/libs/appErr.ts`
- the enums in `prisma/schema.prisma`

Every route listed here is implemented.

---

## 0. Conventions

### Base URL and transport

- Every route is prefixed with `/api`. The frontend reads the base URL from `VITE_API_URL` (default `http://localhost:3000/api`).
- The frontend calls the API directly, cross-origin, with axios `withCredentials: true`. There is no Vite proxy.
- CORS allows only the origins listed in the backend's `CORS_ORIGIN` (comma-separated). It defaults to `http://localhost:5173` outside production and is required in production. Credentials are allowed. The allowed methods are `GET, POST, PUT, PATCH, DELETE`, and the allowed request headers are `Content-Type` and `Authorization`. The headers `RateLimit`, `RateLimit-Policy` and `Retry-After` are exposed to the frontend.
- Request and response bodies are JSON (`Content-Type: application/json`) unless a route says `multipart/form-data` or `text/event-stream`. JSON bodies are limited to 100 kB.
- An unknown route returns `404` `"Route not found"`.

### Authentication

- Protected routes need the header `Authorization: Bearer <accessToken>`. The access token is valid for 1 hour.
- The refresh token is a cookie named `refreshToken`: `HttpOnly`, `SameSite=Strict`, `Path=/api/auth`, `Secure` in production, with a 7-day `Max-Age`. `localhost:5173` and `localhost:3000` count as the same site, so the cookie works in development.
- When a request returns `401`, the frontend calls `POST /api/auth/refresh` once and retries. If the refresh also returns `401`, it sends the user to `/sign-in`.
- `🔒 Student` means a signed-in user with `role = STUDENT`. `🔒 Admin` means `role = ADMIN`. `🔒 any role` means any signed-in user. A user with the wrong role gets `403` `"You don't have permission to do this"`.
- A missing or malformed header returns `401` `"Missing or malformed access token"`. A bad or expired token returns `401` `"Invalid or expired token"`.
- Routes under `/api/me/*` only ever act on the caller's own data. They never take a student id.

### Success envelope

```jsonc
// single resource or action result
{ "data": { ... } }

// paginated list (admin)
{ "data": [ ... ], "meta": { "page": 1, "pageSize": 20, "total": 134 } }
```

`204 No Content` responses have no body.

### Error envelope

```jsonc
{
  "error": {
    "message": "Validation failed",
    // only when the request failed schema validation
    "details": [{ "path": "email", "message": "Invalid Email" }]
  }
}
```

| Status | When |
|---|---|
| 400 | Validation failed (`"Validation failed"` with `details`), malformed JSON, too many files |
| 401 | Missing, invalid or expired token; wrong credentials; the user no longer exists |
| 403 | Signed in, but the role isn't allowed |
| 404 | Resource not found, or not owned by the caller; unknown route |
| 409 | Duplicate, or a delete blocked because student records use the data |
| 413 | An uploaded file is over 25 MB, or the files are over 150 MB in total |
| 415 | An uploaded file isn't a PDF, PNG, JPEG or WebP |
| 422 | Valid input that can't be processed yet, such as "Select your major first" |
| 429 | Rate limited (see below) |
| 500 | Unexpected server error: `{ "error": { "message": "Internal server error" } }` |
| 502 | The AI provider failed (`"The AI provider failed, try again later"`) or returned unusable output (`"AI returned an invalid …"`) |

Validation details:

- Request bodies are trimmed and normalized as described per route. Unknown fields are dropped, except on `PATCH` bodies, which reject unknown fields with `400`.
- `PATCH` bodies need at least one field, otherwise `400` `"Send at least one field to update"`.
- An invalid UUID in a route param returns `400`.

### Rate limits

All windows are 15 minutes. A `429` uses the normal error envelope.

| Limiter | Applies to | Limit | Key | Message |
|---|---|---|---|---|
| Global | Every route except the two polled routes | 100 requests | IP | `"Too many requests, try again later"` |
| Auth | `/api/auth/*` | 10 **failed** requests (4xx/5xx) | IP | `"Too many attempts, try again later"` |
| AI | `POST /me/study-plan/generate`, `/me/what-if`, `/me/advisor/chat`, `/resources/search`, `/quizzes` | 30 requests | user | `"Too many AI requests, try again later"` |
| Poll | `GET /me/documents`, `GET /me/university/sources` | 600 requests | user | `"Too many requests, try again later"` |

### Pagination and list query params

Admin list routes accept these query params:

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int ≥ 1 | `1` | |
| `pageSize` | int 1–100 | `20` | |
| `q` | string | — | Trimmed. An empty value is ignored. Case-insensitive "contains" search; each route lists the fields it searches. |

### Values

- IDs are UUID strings.
- Dates are ISO 8601 strings in UTC (`"2026-10-23T09:14:00.000Z"`).
- Nullable fields are always present and set to `null`. They're never left out. The exceptions are the optional `from` / `to` fields of a what-if plan change.
- Enums use the Prisma names exactly. The frontend maps them to display labels.
- Terms are ordered SPRING → SUMMER → FALL within a year.

### Shared enums

```ts
type UserRole = "STUDENT" | "ADMIN"
type YearOfStudy = "NEW_STUDENT" | "YEAR_1" | "YEAR_2" | "YEAR_3" | "YEAR_4" | "YEAR_5_PLUS"
type DegreeType = "BACHELOR" | "MASTER" | "DOCTORATE" | "ASSOCIATE" | "OTHER"
type Term = "FALL" | "SPRING" | "SUMMER"
type CourseCategory = "MAJOR_REQUIREMENT" | "MAJOR_ELECTIVE" | "MATH_SCIENCE" | "GENERAL_EDUCATION"
type CourseSource = "CATALOG_IMPORT" | "AI_EXTRACTED" | "ADMIN"
type LetterGrade = "A" | "A_MINUS" | "B_PLUS" | "B" | "B_MINUS" | "C_PLUS" | "C" | "C_MINUS" | "D_PLUS" | "D" | "F"
type AcademicRecordStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS"
type PlannedCourseStatus = "PLANNED" | "COMPLETED" | "IN_PROGRESS" | "SKIPPED"
type SourceType = "HTML" | "PDF" | "IMAGE"
type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
type StudentDocumentType = "TRANSCRIPT" | "DEGREE_AUDIT" | "PORTAL_SCREENSHOT" | "OTHER"
type ResourcePlatform = "YOUTUBE" | "UDEMY" | "COURSERA"
type ResourceDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

// Computed by the API, not stored
type StudentCourseStatus = "COMPLETED" | "FAILED" | "IN_PROGRESS" | "PLANNED" | "NOT_TAKEN"
type CatalogStatus = "AVAILABLE" | "PROCESSING" | "UNAVAILABLE"
type StudentStage = "PROCESSED" | "UPLOADED" | "NONE"
```

Grade points used for every GPA: A 4.0, A− 3.7, B+ 3.3, B 3.0, B− 2.7, C+ 2.3, C 2.0, C− 1.7, D+ 1.3, D 1.0, F 0.0. GPAs are credit-weighted and rounded to 2 decimals.

Frontend value mappings:

| Frontend | API |
|---|---|
| `academicYear` (onboarding Transcript step): `new`, `year-1` … `year-5-plus` | `yearOfStudy`: `NEW_STUDENT`, `YEAR_1` … `YEAR_5_PLUS` |
| Grade `"A-"`, `"B+"` | `A_MINUS`, `B_PLUS` |
| Category `"major-requirement"` | `MAJOR_REQUIREMENT` |
| Platform `"youtube"` | `YOUTUBE` |
| Course `title` | `name` |
| Term label `"Fall 2026"` / `"F26"` | `{ "term": "FALL", "year": 2026 }`. The frontend builds the label (except in what-if results, which already contain labels). |

### Shared DTOs

```ts
type UserDto = {
  id: string
  name: string
  email: string
  role: UserRole
}

type UniversitySummaryDto = { id: string; name: string; shortName: string | null }

type UniversityDto = UniversitySummaryDto & {
  country: string
  city: string
  website: string | null
  catalogYear: string | null // "2025–26"
}

type MajorDto = {
  id: string
  universityId: string
  name: string // "Computer Science"
  degreeType: DegreeType
  totalRequiredCredits: number | null
}

type CourseRefDto = { id: string; code: string; name: string }

type CourseSummaryDto = CourseRefDto & {
  credits: number
  category: CourseCategory
}

type CourseDto = CourseSummaryDto & {
  majorId: string
  description: string | null
  offeredTerms: Term[]
  prerequisites: CourseRefDto[] // ordered by code
  corequisites: CourseRefDto[]  // ordered by code
}

type TermDto = { term: Term; year: number }

type StudentStatusDto = {
  status: StudentCourseStatus
  statusDetail: {
    grade: LetterGrade | null // COMPLETED / FAILED
    term: Term | null         // when it was or will be taken
    year: number | null
  }
}

type LearningResourceDto = {
  id: string
  title: string
  url: string
  platform: ResourcePlatform
  provider: string | null // instructor, channel or institution
  format: string | null // "Video series", "Course", "Specialization"
  description: string | null
  duration: string | null // "6 hours", "4 weeks"
  difficulty: ResourceDifficulty | null
  topics: string[]
  verified: boolean // false for resources the AI found
  courses: CourseRefDto[] // ordered by code
}
```

How a course's `StudentStatusDto` is computed (used by `/me/courses`, `/courses/:courseId` and what-if):

1. If the student has a `COMPLETED` record for it → `COMPLETED`, otherwise an `IN_PROGRESS` record → `IN_PROGRESS`, otherwise a `FAILED` record → `FAILED`. The detail comes from the most recent record with that status.
2. Otherwise, if it's `PLANNED` in the latest study plan → `PLANNED`, with the earliest planned semester and `grade: null`.
3. Otherwise → `NOT_TAKEN`, with every detail field `null`.

---

## 1. Auth

All auth routes use the auth rate limiter.

### `POST /api/auth/signin` (register) · public

Creates a **student** account and starts a session. Any `role` the client sends is dropped; admins are promoted with the backend's `pnpm make-admin` script. (Despite the name, this route creates the account; `/login` signs in.)

The year of study isn't part of sign-up. The student picks it later, on the onboarding Transcript step (`PUT /api/me/year-of-study`).

**Request body**

```jsonc
{
  "name": "Maya Chen",              // trimmed, non-empty
  "email": "maya.chen@umich.edu",   // trimmed, lowercased, valid email
  "password": "atlas2026"           // 8+ characters with at least one digit; ≤ 72 bytes UTF-8
}
```

Validation messages: `"Name is required"`, `"Email is required"`, `"Invalid Email"`, `"Password must be at least 8 characters and contain a number"`, `"Password is too long"`.

**Response `201`**

- Header: `Set-Cookie: refreshToken=…; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=604800`

```jsonc
{
  "data": {
    "user": UserDto,
    "accessToken": "eyJhbGciOi..."
  }
}
```

**Errors:** `400` · `409` "Email is already registered" · `429`

---

### `POST /api/auth/login` · public

**Request body**

```jsonc
{ "email": "maya.chen@umich.edu", "password": "atlas2026" }
```

The email is trimmed, lowercased and must be a valid email. The password is only checked for presence (`"Password is required"`); the strength rules belong to registration.

**Response `200`:** same body and cookie as `/signin`.

**Errors:** `400` · `401` "Invalid email or password" (the same message for an unknown email) · `429`

---

### `POST /api/auth/refresh` · cookie

Rotates the session: the old refresh token stops working.

**Request:** no body; the `refreshToken` cookie is required.

**Response `200`:** a new `Set-Cookie: refreshToken=…`, plus:

```jsonc
{ "data": { "accessToken": "eyJhbGciOi..." } }
```

**Errors:** `401` when the cookie is missing or not shaped like a JWT (`"Validation failed"` with `details`), or invalid, expired, revoked or reused (`"Invalid or expired token"`) · `429`

---

### `POST /api/auth/logout` · cookie

Revokes the session and clears the cookie.

**Request:** no body; the cookie is optional.

**Response:** `204`, always, even if the cookie was already invalid.

---

## 2. Current user and onboarding

### `GET /api/me` · 🔒 any role

Loads the signed-in user when the app starts. The frontend uses it to:

- redirect by role (`/app` or `/admin`)
- resume onboarding at the right step after a refresh
- fill the sidebar and top bar

**Response `200`**

```ts
type MeData = {
  user: UserDto
  // null for admins
  profile: {
    university: UniversityDto | null
    major: MajorDto | null
    yearOfStudy: YearOfStudy | null
    onboardingCompletedAt: string | null
  } | null
  // null for admins
  onboarding: {
    universitySelected: boolean         // profile.university !== null
    catalogStatus: CatalogStatus | null // null until a university is selected
    universityDocumentsUploaded: boolean // the student uploaded ≥ 1 catalog source for this university
    yearOfStudySelected: boolean        // profile.yearOfStudy !== null
    transcriptRequired: boolean         // false only when yearOfStudy = NEW_STUDENT (true while it's null)
    transcriptUploaded: boolean         // ≥ 1 StudentDocument of type TRANSCRIPT
    completed: boolean                  // onboardingCompletedAt !== null
  } | null
}
```

```jsonc
{ "data": MeData }
```

`catalogStatus` is derived from the university's catalog sources:

- `AVAILABLE` when at least one source is `COMPLETED`
- `PROCESSING` when none is completed but at least one is `PENDING` or `PROCESSING`
- `UNAVAILABLE` otherwise, including when there are no sources

**Errors:** `401` (including `"User not found"` when the account no longer exists)

---

### `PUT /api/me/university` · 🔒 Student

Onboarding **University** step (`UniversityFinder.tsx`). The backend:

1. finds the university by name and country, ignoring case, accents, repeated spaces and a leading "The", and also matching `shortName`
2. if the university exists and already has a major with that name, saves both on the student's profile and returns
3. otherwise creates the university if needed, then **asks the AI to find catalog pages on the web, reads them and extracts the major and its courses** (saved with `source = AI_EXTRACTED`), then saves the selection

Step 3 is synchronous and can take a long time, so the frontend shows a loading state and uses a long timeout. The saved major's name may come from the catalog rather than what was typed. Selecting a university replaces both the previous university and major.

**Request body:** the same rules as the frontend's `universityStepSchema`. Every field is trimmed.

```jsonc
{
  "name": "University of Michigan",  // 3–120
  "country": "United States",        // 2–60, letters only
  "city": "Ann Arbor",               // 1–80, letters only
  "major": "Computer Science"        // 2–100
}
```

"Letters only" means letters, accents, spaces and `. ' ’ ( ) -`.

**Response `200`**

```ts
type UniversityData = {
  university: UniversityDto // its name is the stored one, which may differ from what was typed ("UBC")
  major: MajorDto | null    // set in practice
  catalog: {
    status: CatalogStatus
    title: string | null    // title of the newest completed source
    source: string | null   // hostname of that source, e.g. "lsa.umich.edu"
    courseCount: number     // courses across the university
    majorCount: number
  }
}
```

```jsonc
{ "data": { ...UniversityData, "replaced": false } }  // replaced: true if a different university was selected before
```

`catalog.status` decides the next screen: `AVAILABLE` skips university documents, while `UNAVAILABLE` and `PROCESSING` ask for documents.

**Errors:** `400` · `401` · `403` (admin) · `502` (the AI couldn't find or read the catalog)

---

### `POST /api/me/university/sources` · 🔒 Student

Onboarding **University documents** step. Uploads catalog or curriculum files for the student's university and major. The upload is **processed synchronously**: PDF text and images are read by the AI, the major's courses are extracted and saved, and each file is stored as a completed `CourseMaterialSource` uploaded by the student. The request is slow.

**Request:** `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `files` | File, repeated | 1–20 files; PDF, PNG, JPEG or WebP; non-empty; ≤ 25 MB each; ≤ 150 MB total |

The file type is checked twice: first from the declared MIME type (`415` "Only PDF, PNG, JPEG or WebP files are allowed"), then from the file's bytes (`400` "File must be a PDF, PNG, JPEG or WebP").

**Response `200`:** the updated university, without `replaced`.

```jsonc
{ "data": UniversityData }
```

**Errors**

- `400` (validation, including more than 20 files)
- `401` · `403` (admin)
- `413` · `415`
- `422` "Select your university first" (no university or no major selected yet), "Could not find Computer Science in the uploaded files", "Could not read transcript.pdf"
- `502`

---

### `GET /api/me/university/sources` · 🔒 Student · poll limiter

Lists **all** catalog sources of the student's university (not only the ones this student uploaded), newest first.

**Response `200`**

```ts
type UniversitySourceDto = {
  id: string
  title: string | null       // the file name for uploads
  sourceType: SourceType
  status: ProcessingStatus
  errorMessage: string | null
  createdAt: string
}
```

```jsonc
{ "data": UniversitySourceDto[] }
```

> `CourseMaterialSource` has no `status` column. The backend derives it:
> - `FAILED` when `errorMessage` is set
> - `COMPLETED` when `lastProcessedAt` is set
> - `PROCESSING` when `lastFetchedAt` is set
> - `PENDING` otherwise
>
> Sources saved today are always `COMPLETED`, because extraction runs during the request.

**Errors:** `401` · `403` · `422` "Select your university first" · `429`

---

### `PUT /api/me/year-of-study` · 🔒 Student

Onboarding **Transcript** step (`Transcript.tsx`, the "Year & transcript" tab). It saves the year the student selects there. The frontend calls it when the step is submitted, before any upload. A `NEW_STUDENT` has no courses on record, so for them this is the whole step and no transcript is uploaded.

The student can come back and change the year. Moving to or from `NEW_STUDENT` only changes `transcriptRequired`. Documents already uploaded are kept.

**Request body**

```jsonc
{ "yearOfStudy": "YEAR_2" }   // YearOfStudy ("Select a valid year of study")
```

**Response `200`**

```jsonc
{
  "data": {
    "yearOfStudy": "YEAR_2",
    "transcriptRequired": true    // false when yearOfStudy = NEW_STUDENT
  }
}
```

**Errors:** `400` · `401` · `403` (admin)

---

### `PATCH /api/me/profile` · 🔒 Student

Updates profile fields after onboarding. Today the only field is the year of study.

**Request body:** unknown fields are rejected, and at least one field is required.

```jsonc
{ "yearOfStudy": "YEAR_3" }   // optional YearOfStudy
```

**Response `200`:** the same `data` as `GET /api/me`.

**Errors:** `400` · `401` · `403` (admin)

---

### `POST /api/me/documents` · 🔒 Student

Onboarding **Transcript** step, for students who aren't `NEW_STUDENT`. Uploads academic documents. The upload is **processed synchronously**: the AI reads the files, the extracted courses are matched by code to the student's major, the files are stored, and the documents are saved as `COMPLETED`. The request is slow.

> ⚠️ A successful upload **replaces all of the student's academic records** with the ones extracted from this upload. Records for courses that aren't in the major are dropped.

**Request:** `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `files` | File, repeated | Same limits as the university sources. A file whose bytes aren't a PDF or image is a `415` here. |
| `type` | `StudentDocumentType` | Optional; defaults to `TRANSCRIPT` |

**Response `201`**

```ts
type StudentDocumentDto = {
  id: string
  type: StudentDocumentType
  fileName: string
  mimeType: string
  fileSize: number
  status: ProcessingStatus   // COMPLETED for uploads processed today
  errorMessage: string | null
  processedAt: string | null
  createdAt: string
}
```

```jsonc
{ "data": StudentDocumentDto[] }
```

**Errors**

- `400` · `401` · `403` (admin) · `413` · `415`
- `422` "Select your university first" (no university or no major), "None of the courses in the uploaded files are in Computer Science", "Could not read transcript.pdf"
- `502`

---

### `GET /api/me/documents` · 🔒 Student · poll limiter

Lists the student's uploaded documents, newest first.

**Query**

| Param | Type | Notes |
|---|---|---|
| `type` | `StudentDocumentType` | Optional filter |

**Response `200`**

```jsonc
{ "data": StudentDocumentDto[] }
```

**Errors:** `400` · `401` · `403` · `429`

---

### `POST /api/me/onboarding/complete` · 🔒 Student

The **Complete** step's "Go to dashboard" action. It sets `onboardingCompletedAt`. If onboarding is already complete, it returns the current data unchanged.

**Request:** no body.

**Response `200`:** the same `data` as `GET /api/me`.

**Errors:** `401` · `403` · `422` with one of these messages, checked in this order:

- "Select your university and major first"
- "Your university's course catalog isn't ready yet" (when `catalogStatus` isn't `AVAILABLE`)
- "Select your year of study first"
- "Upload your transcript first" (when `transcriptRequired` and no `TRANSCRIPT` document exists)

---

## 3. Student academics

### `GET /api/me/academic-summary` · 🔒 Student

Everything the **Overview** dashboard shows, computed on the server from `AcademicRecord`, `Course`, `Major` and the latest `StudyPlan`.

**Response `200`**

```ts
type AcademicSummaryDto = {
  student: {
    name: string
    university: UniversitySummaryDto | null
    major: MajorDto | null
    yearOfStudy: YearOfStudy | null
  }
  gpa: {
    cumulative: number | null          // null when nothing has been graded yet
    changeSinceLastYear: number | null // cumulative now minus cumulative without the last 2 finished terms
  }
  credits: {
    completed: number
    inProgress: number
    required: number | null            // Major.totalRequiredCredits
    remaining: number | null           // max(required − completed, 0)
  }
  graduation: {
    progressPercent: number | null     // round(completed / required × 100), capped at 100
    expected: TermDto | null           // last semester of the latest plan
  }
  // the latest term with IN_PROGRESS records; null when there are none
  currentTerm: (TermDto & {
    credits: number
    courses: {
      recordId: string
      course: CourseSummaryDto
      expectedGrade: LetterGrade | null
    }[]
  }) | null
  // the latest term with COMPLETED or FAILED records
  lastTerm: (TermDto & {
    gpa: number | null
    courses: {
      course: CourseSummaryDto
      status: AcademicRecordStatus
      grade: LetterGrade | null
    }[]
  }) | null
  // finished terms, oldest first; feeds the GPA trend chart
  termHistory: (TermDto & { gpa: number | null; credits: number })[]
  // always one entry per CourseCategory; feeds the requirement progress bars
  requirements: {
    category: CourseCategory
    completedCredits: number
    plannedCredits: number             // completed + in progress + PLANNED in the latest plan
  }[]
}
```

```jsonc
{ "data": AcademicSummaryDto }
```

> GPA counts every graded record that isn't `IN_PROGRESS`, so **a FAILED attempt's F counts as 0.0**. `credits.completed` only counts `COMPLETED` records, while `termHistory[].credits` counts both completed and failed records in that term.

**Errors:** `401` · `403` · `422` "Select your university first" (the student has no profile yet)

---

### `GET /api/me/academic-records` · 🔒 Student

The student's records, flat. The **Semester plan** page uses it for completed semesters, and **Sources** uses it for failed attempts.

**Query**

| Param | Type | Notes |
|---|---|---|
| `status` | `AcademicRecordStatus` | Optional |
| `term` | `Term` | Optional |
| `year` | positive int | Optional |

**Response `200`:** ordered by `year`, then term (SPRING → SUMMER → FALL), then course code.

```ts
type AcademicRecordDto = TermDto & {
  id: string
  course: CourseSummaryDto
  status: AcademicRecordStatus
  grade: LetterGrade | null         // null for IN_PROGRESS
  expectedGrade: LetterGrade | null // only used for IN_PROGRESS
}
```

```jsonc
{ "data": AcademicRecordDto[] }
```

**Errors:** `400` · `401` · `403`

---

### `GET /api/me/courses` · 🔒 Student

The **Courses** page: every course in the student's major, with the student's status for each, ordered by code. The list isn't paginated; the frontend counts the filter chips locally.

**Query**

| Param | Type | Notes |
|---|---|---|
| `q` | string | Matches code, name or description (case-insensitive) |
| `category` | `CourseCategory` | Optional |
| `status` | `StudentCourseStatus` | Optional |

**Response `200`**

```ts
type RequisiteDto = CourseRefDto & { met: boolean }

type StudentCourseDto = CourseSummaryDto & StudentStatusDto & {
  majorId: string
  description: string | null
  offeredTerms: Term[]
  prerequisites: RequisiteDto[] // met = COMPLETED in the student's records
  corequisites: RequisiteDto[]  // met = COMPLETED or IN_PROGRESS
}
```

```jsonc
{ "data": StudentCourseDto[] }
```

**Errors:** `400` · `401` · `403` · `422` "Select your major first"

---

### `GET /api/courses/:courseId` · 🔒 any role

A course's details, for a course details page or when a course chip is clicked.

**Params:** `courseId` (uuid)

**Response `200`**

```ts
type CourseDetailsDto = CourseDto & {
  requiredFor: CourseRefDto[]          // courses that list this one as a prerequisite, ordered by code
  resources: LearningResourceDto[]     // ordered by title
  studentStatus: StudentStatusDto | null // null for admins
}
```

```jsonc
{ "data": CourseDetailsDto }
```

**Errors:** `400` · `401` · `404` "Course not found"

---

## 4. Study plan

```ts
type StudyPlanCourseDto = {
  id: string                  // StudyPlanCourse.id
  status: PlannedCourseStatus
  course: CourseDto
}

type StudyPlanDto = {
  id: string
  name: string                // "Study plan"
  generatedAt: string         // StudyPlan.createdAt
  assumptions: string[]
  notes: string[]
  semesters: (TermDto & {     // oldest first
    id: string
    rationale: string | null
    credits: number           // every course except SKIPPED ones
    courses: StudyPlanCourseDto[] // ordered by code
  })[]
  totals: {
    plannedCredits: number    // PLANNED courses across the plan
    creditsRequired: number | null
    meetsDegreeTotal: boolean | null // COMPLETED + IN_PROGRESS records + plannedCredits ≥ required
  }
  expectedGraduation: TermDto | null // the last semester
}
```

### `GET /api/me/study-plan` · 🔒 Student

The student's latest study plan, for the **Semester plan** page. The frontend merges it with the completed semesters from `/api/me/academic-records`.

**Response `200`**

```jsonc
{ "data": StudyPlanDto | null }   // null when no plan has been generated
```

**Errors:** `401` · `403`

---

### `POST /api/me/study-plan/generate` · 🔒 Student · AI

Generates a new plan through graduation. The plan starts at the semester after the later of today's term and the student's latest record. The AI proposes the semesters, and the backend checks prerequisites, offered terms and the credit limit. Courses that break a rule are left out, with a note in `notes`. Earlier plans are kept, and the newest one becomes "the" plan. The route is slow (several seconds), so the frontend shows a loading state and uses a long timeout.

**Request body:** optional.

```jsonc
{ "maxCreditsPerSemester": 16 }   // optional int, 12–18, default 16
```

**Response `201`**

```jsonc
{ "data": StudyPlanDto }
```

**Errors:** `400` · `401` · `403` · `422` "Select your major first", "Your major has no courses yet" or "You have no courses left to plan" · `429` · `502`

---

### `PATCH /api/me/study-plan/courses/:planCourseId` · 🔒 Student

Marks a planned course as skipped, or restores it.

**Params:** `planCourseId` (uuid; must belong to one of the caller's plans)

**Request body:** unknown fields are rejected.

```jsonc
{ "status": "SKIPPED" }   // "PLANNED" or "SKIPPED" only ("Status must be PLANNED or SKIPPED")
```

**Response `200`**

```jsonc
{ "data": StudyPlanCourseDto }
```

**Errors:** `400` · `401` · `403` · `404` "Planned course not found"

---

## 5. What-if analysis

### `POST /api/me/what-if` · 🔒 Student · AI

Analyzes a scenario described in natural language, using the student's real record and latest plan. **Nothing is saved, and the record and plan aren't modified.** The AI only identifies the scenario; the backend computes the result.

**Request body**

```jsonc
{ "scenario": "What if I fail CS 3110 this semester?" }   // trimmed, 10–500 characters
```

**Response `200`:** labels are display strings (`"Spring 2027"`, graduation `"December 2027"`) and course references are codes, because the page only displays them.

```ts
type ScenarioResult = ScenarioAnalysis | UnclearScenario

type ScenarioAnalysis = {
  status: "ok"
  kind: "fail" | "grade-change" | "retake" | "add" | "move-earlier" | "drop" | "swap"
  headline: string                         // "Graduation moves one semester later"
  summary: string
  gpa: { label: string; current: number | null; scenario: number | null }
  credits: { label: string; current: number; scenario: number }
  graduation: { current: string; scenario: string; semestersDelta: number }
  planChanges: {
    kind: "added" | "removed" | "moved" | "retake"
    code: string
    title: string
    from?: string                          // semester label
    to?: string
  }[]
  semesters: {
    current: { label: string; courses: string[]; credits: number }[]
    scenario: { label: string; courses: string[]; credits: number }[]
  }
  comparison: { label: string; current: string; scenario: string; effect: "better" | "worse" | "neutral" }[]
  warnings: string[]
  assumptions: string[]
}

type UnclearScenario = {
  status: "unclear"
  message: string                          // "I couldn't find CS 9999 in your major's courses. Which course do you mean?"
  suggestions: string[]                    // example scenarios the student can click
}
```

```jsonc
{ "data": ScenarioResult }
```

An unclear scenario returns `200` with `status: "unclear"`, not an error.

**Errors:** `400` · `401` · `403` · `422` "Select your major first" or "Generate a study plan first" · `429` · `502`

---

## 6. AI advisor

### `POST /api/me/advisor/chat` · 🔒 Student · AI · streaming

Streams the advisor's reply, grounded in the student's academic summary, courses, records and latest plan. The chat history isn't stored; the client sends it with each request. The frontend cancels a reply by aborting the request.

**Request body**

```jsonc
{
  "messages": [
    { "role": "student", "content": "What are the prerequisites for CS 4410?" },
    { "role": "assistant", "content": "…" },
    { "role": "student", "content": "Can I take it next semester?" }
  ]
}
```

- `messages`: 1–20 items, oldest first, and the last item must have `role: "student"` (`"The last message must be from the student"`).
- `role`: `"student"` or `"assistant"`.
- `content`: trimmed. Student messages are 1–1000 characters; assistant messages are 1–8000.

**Response `200`:** `Content-Type: text/event-stream`, `Cache-Control: no-cache`

```
event: delta
data: {"text":"**CS 4410 Operating Systems** — 4 credits, "}

event: delta
data: {"text":"offered Spring only."}

event: done
data: {}
```

If the AI fails partway through, the stream sends `event: error` with `data: {"message":"The advisor is unavailable right now."}` and then closes. When the client aborts, the stream just closes. The reply may contain Markdown (bold, lists).

**Errors before the stream starts** are sent as normal JSON: `400` · `401` · `403` · `422` "Select your university first" or "Select your major first" · `429` · `502`

---

## 7. Learning resources and quizzes (Sources page)

### `GET /api/me/recommendations` · 🔒 Student

The "Focus courses" sections:

- **failed**: courses whose latest failed attempt hasn't been passed since, with the term of the retake if one exists (the first record after the failure)
- **difficult**: `IN_PROGRESS` courses whose `expectedGrade` is **C+ or lower**, lowest first. Courses already listed under failed are left out.

Each comes with the learning resources linked to the course. The first time a recommended course has no resources, the backend asks the AI (with web search) to find some, checks that the links work, and saves them with `verified: false`. That makes the first load slow. If the search fails, the recommendations are still returned, without new resources.

`why` is a short generated sentence, for example `"Failed in Spring 2024 with F. Not retaken yet. Required for CS 3110, CS 4410."` or `"Expected grade is C. Builds on CS 2110 (C-). Required for CS 4410."`.

**Response `200`**

```jsonc
{
  "data": {
    "failed": [
      {
        "course": CourseSummaryDto,
        "why": "…",
        "attempt": { "term": "SPRING", "year": 2024, "grade": "F" | null, "retakenIn": TermDto | null },
        "resources": LearningResourceDto[]
      }
    ],
    "difficult": [
      {
        "course": CourseSummaryDto,
        "why": "…",
        "expectedGrade": "C",
        "resources": LearningResourceDto[]
      }
    ]
  }
}
```

Both lists are empty when the student has no records.

**Errors:** `401` · `403`

---

### `POST /api/resources/search` · 🔒 Student · AI

The AI-powered resource search.

1. The query is recognized as a course in the student's major when it equals that course's code or name (ignoring case and spacing).
2. Stored resources on the selected platforms that are linked to that course or mention the query are returned first, course-linked ones first.
3. When fewer than 3 stored resources match, or a `goal` is given, the AI searches the web. Working links on the selected platforms are saved with `verified: false` and added after the stored ones.

At most 20 results are returned.

**Request body:** the same rules as `resourceSearchSchema`.

```jsonc
{
  "query": "CS 3110",                          // trimmed, 2–100: a course code, course name or topic
  "goal": "I keep getting lost in recursion",  // optional, ≤ 300; empty is ignored
  "platforms": ["YOUTUBE", "COURSERA"]         // ResourcePlatform[], at least 1, duplicates removed
}
```

**Response `200`**

```jsonc
{
  "data": {
    "results": LearningResourceDto[],          // may be empty
    "matchedCourse": CourseSummaryDto | null   // the course the query was recognized as
  }
}
```

**Errors:** `400` · `401` · `403` · `429` · `502` (only when the AI search fails and no stored resources matched)

---

### `POST /api/quizzes` · 🔒 Student · AI

Generates a practice quiz for a resource, or for a course, from its title, description and topics. **The quiz isn't stored.** Scoring happens on the client, so the answers are included. The options are shuffled.

**Request body:** send exactly one of `resourceId` or `courseId`. The other can be left out or `null`.

```jsonc
{
  "resourceId": "…",       // uuid
  "courseId": null,        // uuid
  "count": 10              // 5 | 10 | 15
}
```

**Response `201`**

```jsonc
{
  "data": {
    "id": "…",                              // random, not persisted
    "topic": "Algorithms",                  // display label
    // at most `count` questions; can be fewer if the AI returns fewer
    "questions": [
      {
        "id": "q1",                          // "q1", "q2", …
        "prompt": "What is the worst-case time complexity of quicksort?",
        "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],   // exactly 4, distinct
        "answer": 2,                         // index into options
        "explanation": "When the pivot is always the smallest or largest element…"
      }
    ]
  }
}
```

**Errors:** `400` ("Send exactly one of resourceId or courseId", "Choose 5, 10 or 15 questions") · `401` · `403` · `404` "Resource not found" or "Course not found" · `422` "Not enough material to build a quiz" · `429` · `502`

---

## 8. Admin

Every route in this section is **🔒 Admin**. Students get `403`.

### `GET /api/admin/stats`

The admin **Dashboard**: stat tiles, the registrations chart and the catalog-coverage bar.

**Query**

| Param | Type | Default | Notes |
|---|---|---|---|
| `months` | int 1–24 | `8` | How many months of registrations to return, ending with the current month (UTC) |

**Response `200`**

```jsonc
{
  "data": {
    "counts": {
      "students": 64,
      "universities": 15,
      "majors": 40,
      "courses": 1240,
      "aiExtractedCourses": 312          // Course.source = AI_EXTRACTED
    },
    // student sign-ups, oldest first, with zero-filled months
    "registrationsByMonth": [ { "month": "2026-03", "count": 4 } ],
    "universitiesByCatalogStatus": { "AVAILABLE": 9, "PROCESSING": 2, "UNAVAILABLE": 4 },
    "sourcesByStatus": { "PENDING": 3, "PROCESSING": 1, "COMPLETED": 41, "FAILED": 2 }
  }
}
```

**Errors:** `400` · `401` · `403`

---

### Universities

```ts
type AdminUniversityDto = UniversityDto & {
  createdAt: string
  updatedAt: string
  majorCount: number
  courseCount: number
  studentCount: number   // students who aren't deleted
  catalogStatus: CatalogStatus
}
```

Body field rules, shared by POST and PATCH (every field is trimmed):

| Field | Rules |
|---|---|
| `name` | 3–120 |
| `shortName` | ≤ 12 |
| `country` | 2–60, letters only |
| `city` | 1–80, letters only |
| `website` | http(s) URL ("Enter a full address starting with https://") |
| `catalogYear` | `/^\d{4}[–-]\d{2}$/` ("Use the format 2025–26") |

#### `GET /api/admin/universities`

Ordered by name.

**Query:** `page`, `pageSize`, `q` (matches name, shortName, city or country), `country` (optional, exact match ignoring case), `catalogStatus` (optional `CatalogStatus`)

**Response `200`**

```jsonc
{ "data": AdminUniversityDto[], "meta": { "page", "pageSize", "total" } }
```

#### `GET /api/admin/universities/:universityId`

The university details sheet.

**Params:** `universityId` (uuid)

**Response `200`**

```ts
type AdminMajorDto = MajorDto & { courseCount: number; studentCount: number }

type AdminUniversitySourceDto = {
  id: string
  title: string | null
  url: string
  sourceType: SourceType
  status: ProcessingStatus
  errorMessage: string | null
  lastProcessedAt: string | null
  createdAt: string
}
```

```jsonc
{
  "data": {
    ...AdminUniversityDto,
    "majors": AdminMajorDto[],             // ordered by name
    "sources": AdminUniversitySourceDto[]  // newest first
  }
}
```

**Errors:** `400` · `404` "University not found"

#### `POST /api/admin/universities`

**Request body**

```jsonc
{
  "name": "University of Michigan",
  "shortName": "U-M",                // optional
  "country": "United States",
  "city": "Ann Arbor",
  "website": "https://umich.edu",    // optional
  "catalogYear": "2025–26"           // optional
}
```

Optional fields may be left out, `null` or `""`; all three are stored as `null`.

**Response `201`**

```jsonc
{ "data": AdminUniversityDto }
```

**Errors:** `400` · `409` "A university with this name already exists in this country"

#### `PATCH /api/admin/universities/:universityId`

**Request body:** any subset of the POST fields, at least one; unknown fields are rejected. Omitted fields are left unchanged, and `null` or `""` clears an optional field.

**Response `200`**

```jsonc
{ "data": AdminUniversityDto }
```

**Errors:** `400` · `404` "University not found" · `409` "A university with this name already exists in this country"

#### `DELETE /api/admin/universities/:universityId`

Deletes the university along with its majors, courses and sources, and the study plans that use its courses. Student profiles that pointed to it are set to `null`.

**Response:** `204`

**Errors:** `400` · `404` "University not found" · `409` "Courses at this university are used in student records"

---

### Majors

Body field rules, shared by POST and PATCH:

| Field | Rules |
|---|---|
| `name` | trimmed, 2–100 |
| `degreeType` | `DegreeType` ("Select a valid degree type") |
| `totalRequiredCredits` | int 1–300, or `null` |

#### `GET /api/admin/universities/:universityId/majors`

Ordered by name.

**Response `200`**

```jsonc
{ "data": AdminMajorDto[] }
```

**Errors:** `400` · `404` "University not found"

#### `POST /api/admin/universities/:universityId/majors`

**Request body**

```jsonc
{
  "name": "Computer Science",
  "degreeType": "BACHELOR",          // optional, default BACHELOR
  "totalRequiredCredits": 128        // optional, default null
}
```

**Response `201`**

```jsonc
{ "data": MajorDto }
```

**Errors:** `400` · `404` "University not found" · `409` "This major already exists at this university"

#### `PATCH /api/admin/majors/:majorId`

**Request body:** any subset of the POST fields, at least one; unknown fields are rejected. `totalRequiredCredits: null` clears it.

**Response `200`**

```jsonc
{ "data": MajorDto }
```

**Errors:** `400` · `404` "Major not found" · `409` "This major already exists at this university"

#### `DELETE /api/admin/majors/:majorId`

Deletes the major and its courses.

**Response:** `204`

**Errors:** `400` · `404` "Major not found" · `409` "Courses in this major are used in student records"

---

### Courses

```ts
type AdminCourseDto = CourseDto & {
  university: UniversitySummaryDto
  major: { id: string; name: string; degreeType: DegreeType }
  source: CourseSource                          // the UI's "AI-captured" badge = AI_EXTRACTED
  updatedAt: string
  updatedBy: { id: string; name: string } | null   // null for imports and AI extraction
}
```

Body field rules, shared by POST and PATCH:

| Field | Rules |
|---|---|
| `majorId` | uuid ("Choose a major") |
| `code` | Formatted server-side: `"cs3110"`, `"cs-3110"` and `"CS  3110"` all become `"CS 3110"`. Must then match `/^[A-Z]{2,5} \d{3,4}[A-Z]?$/` ("Use a code like CS 3110 or MATH 101"). |
| `name` | trimmed, 3–100 (the frontend field is `title`) |
| `description` | trimmed, 20–400 |
| `credits` | int 0–8 |
| `category` | `CourseCategory` |
| `offeredTerms` | `Term[]`, may be empty; duplicates removed |
| `prerequisites` / `corequisites` | Course codes in the same major, formatted like `code`; blanks and duplicates removed |

#### `GET /api/admin/courses`

The admin **Courses** table, ordered by code. `/admin/courses?university=<id>` is a link the UI already uses.

**Query**

| Param | Type | Notes |
|---|---|---|
| `page`, `pageSize` | | |
| `q` | string | Matches code or name |
| `universityId` | uuid | Optional |
| `majorId` | uuid | Optional |
| `category` | `CourseCategory` | Optional |
| `source` | `CourseSource` | Optional |

**Response `200`**

```jsonc
{ "data": AdminCourseDto[], "meta": { "page", "pageSize", "total" } }
```

**Errors:** `400`

#### `POST /api/admin/courses`

**Request body**

```jsonc
{
  "majorId": "…",
  "code": "CS 3110",
  "name": "Data Structures & Algorithms",
  "description": "Lists, trees, hash tables…",
  "credits": 4,
  "category": "MAJOR_REQUIREMENT",
  "offeredTerms": ["FALL", "SPRING"],         // optional, default []
  "prerequisites": ["CS 1120", "MATH 2310"],  // optional, default []
  "corequisites": []                          // optional, default []
}
```

The backend resolves the requisite codes to course ids within the same major. It sets `source = ADMIN` and `updatedById` to the caller.

**Response `201`**

```jsonc
{ "data": AdminCourseDto }
```

**Errors**

- `400`, with `details` paths `prerequisites` / `corequisites` for: a malformed code ("Check the format of …"), an unknown code ("CS 9999 isn't in this major's courses"), or a course that requires itself ("A course can't require itself")
- `404` "Major not found"
- `409` "CS 3110 already exists in this major"

#### `PATCH /api/admin/courses/:courseId`

**Request body:** any subset of the POST fields, at least one; unknown fields are rejected. If `prerequisites` or `corequisites` is sent, it **replaces** that list. Sending a different `majorId` moves the course: its requisites must exist in the new major, and links from courses in the old major are removed. The backend sets `updatedById` to the caller.

**Response `200`**

```jsonc
{ "data": AdminCourseDto }
```

**Errors:** `400` · `404` "Course not found" or "Major not found" · `409` "CS 3110 already exists in this major"

#### `DELETE /api/admin/courses/:courseId`

**Response:** `204`

**Errors:** `400` · `404` "Course not found" · `409` "This course is used in student records or plans"

---

### Students (read-only)

Deleted accounts are never listed.

```ts
type AdminStudentDto = {
  id: string                                     // User.id
  name: string
  email: string
  university: UniversitySummaryDto | null
  major: { id: string; name: string; degreeType: DegreeType } | null
  yearOfStudy: YearOfStudy | null
  registeredAt: string                           // User.createdAt
  lastActiveAt: string | null                    // latest Session.lastUsedAt
  stage: StudentStage                            // PROCESSED: has records · UPLOADED: has documents only · NONE: nothing
  academic: {
    gpa: number | null                           // same rule as the academic summary (failed grades count)
    creditsCompleted: number
    creditsRequired: number | null
    expectedGraduation: TermDto | null           // last semester of the newest plan
  } | null                                       // null while stage !== "PROCESSED"
  documents: { transcripts: number }
}
```

The admin side never returns transcript contents or individual grades, only these summary values.

#### `GET /api/admin/students`

Newest registrations first.

**Query:** `page`, `pageSize`, `q` (matches name or email), `universityId` (optional uuid), `stage` (optional `StudentStage`)

**Response `200`**

```jsonc
{ "data": AdminStudentDto[], "meta": { "page", "pageSize", "total" } }
```

**Errors:** `400`

#### `GET /api/admin/students/:studentId`

The student details sheet. `studentId` is the `User.id`.

**Response `200`**

```jsonc
{
  "data": {
    ...AdminStudentDto,
    "onboardingCompletedAt": "…" | null,
    // newest first
    "documentsList": [ { "id", "type", "fileName", "status", "createdAt" } ]
  }
}
```

**Errors:** `400` · `404` "Student not found"

---

## 9. Route index

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/signin` | public | auth limiter |
| POST | `/api/auth/login` | public | auth limiter |
| POST | `/api/auth/refresh` | cookie | auth limiter |
| POST | `/api/auth/logout` | cookie | auth limiter |
| GET | `/api/me` | any | |
| PUT | `/api/me/university` | student | slow (AI) when the major is new |
| GET | `/api/me/university/sources` | student | poll limiter |
| POST | `/api/me/university/sources` | student | multipart, slow (AI) |
| PUT | `/api/me/year-of-study` | student | |
| PATCH | `/api/me/profile` | student | |
| GET | `/api/me/documents` | student | poll limiter |
| POST | `/api/me/documents` | student | multipart, slow (AI), replaces records |
| POST | `/api/me/onboarding/complete` | student | |
| GET | `/api/me/academic-summary` | student | |
| GET | `/api/me/academic-records` | student | |
| GET | `/api/me/courses` | student | |
| GET | `/api/courses/:courseId` | any | |
| GET | `/api/me/study-plan` | student | |
| POST | `/api/me/study-plan/generate` | student | AI limiter |
| PATCH | `/api/me/study-plan/courses/:planCourseId` | student | |
| POST | `/api/me/what-if` | student | AI limiter |
| POST | `/api/me/advisor/chat` (SSE) | student | AI limiter |
| GET | `/api/me/recommendations` | student | may call the AI |
| POST | `/api/resources/search` | student | AI limiter |
| POST | `/api/quizzes` | student | AI limiter |
| GET | `/api/admin/stats` | admin | |
| GET / POST | `/api/admin/universities` | admin | |
| GET / PATCH / DELETE | `/api/admin/universities/:universityId` | admin | |
| GET / POST | `/api/admin/universities/:universityId/majors` | admin | |
| PATCH / DELETE | `/api/admin/majors/:majorId` | admin | |
| GET / POST | `/api/admin/courses` | admin | |
| PATCH / DELETE | `/api/admin/courses/:courseId` | admin | |
| GET | `/api/admin/students` | admin | |
| GET | `/api/admin/students/:studentId` | admin | |

### Not implemented yet

- A transcript extraction review step (edit or confirm extracted records before they're saved), with routes like `GET /api/me/documents/:id/extraction` and `POST /api/me/academic-records` (bulk).
- Admin management of learning resources and catalog sources (`/api/admin/learning-resources`, `POST /api/admin/sources/:id/retry`).
- An AI-generated text for the Overview "advisor insight" card. It could later be one more field on `/api/me/academic-summary`.
