# AcadPath API Contract (frontend → backend)

The routes the frontend needs from the backend, with their request and response shapes.

These shapes come from two places:

- The backend contract that already exists: the `/api/auth/*` routes covered by `backend/test/auth/*`, the error format in `backend/src/middlewares/errorHandler.ts`, and the enums in `backend/prisma/schema.prisma`.
- The data that frontend pages already render today from mocks and simulations (`src/mock/*`, `src/simulation/*`, `src/types/*`, `src/schemas/*`).

Status legend: **EXISTS**: implemented or covered by backend tests · **NEEDED**: a current screen depends on it · **LATER**: needed once a planned screen exists.

---

## 0. Conventions

### Base URL and transport

- Every route is prefixed with `/api`.
- Request and response bodies are JSON (`Content-Type: application/json`) unless a route says `multipart/form-data` or `text/event-stream`.
- The refresh cookie is `httpOnly`, `SameSite=Strict` and scoped to `Path=/api/auth`. In development the frontend calls the API through the Vite proxy (`/api → backend`) so the cookie is first-party, and axios uses `withCredentials: true`.

### Authentication

- Protected routes need the header `Authorization: Bearer <accessToken>`. The access token is valid for 1 hour.
- When a request returns `401`, the frontend calls `POST /api/auth/refresh` once and retries. If the refresh also returns `401`, it sends the user to `/sign-in`.
- `🔒 Student` means any signed-in user with `role = STUDENT`. `🔒 Admin` means `role = ADMIN`. A user with the wrong role gets `403`.
- Routes under `/api/me/*` only ever act on the caller's own data. They never take a student id.

### Success envelope

```jsonc
// single resource or action result
{ "data": { ... } }

// paginated list
{ "data": [ ... ], "meta": { "page": 1, "pageSize": 20, "total": 134 } }
```

`204 No Content` responses have no body.

### Error envelope (already implemented)

```jsonc
{
  "error": {
    "message": "Validation failed",
    // only for 400 validation errors
    "details": [{ "path": "email", "message": "Enter a valid email address" }]
  }
}
```

| Status | When |
|---|---|
| 400 | Validation failed, or malformed JSON |
| 401 | Missing, invalid or expired token; wrong credentials |
| 403 | Signed in, but the role isn't allowed |
| 404 | Resource not found, or not owned by the caller |
| 409 | Duplicate, such as an email already registered or a course code already used in a major |
| 413 | Upload too large |
| 415 | Unsupported file type |
| 422 | Valid input that can't be processed, such as "no major selected yet" |
| 429 | Rate limited (auth and AI routes) |
| 5xx | Server or AI provider failure (`{ "error": { "message": "Internal server error" } }`) |

### Pagination and list query params

Admin list routes accept these query params:

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int ≥ 1 | `1` | |
| `pageSize` | int 1–100 | `20` | |
| `q` | string | — | Case-insensitive search. Each route lists the fields it searches. |

### Values

- IDs are UUID strings.
- Dates are ISO 8601 strings in UTC (`"2026-10-23T09:14:00.000Z"`).
- Nullable fields are always present and set to `null`. They're never left out.
- Enums use the Prisma names exactly. The frontend maps them to display labels.

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
```

Frontend value mappings:

| Frontend | API |
|---|---|
| `academicYear` (onboarding Transcript step): `new`, `year-1` … `year-5-plus` | `yearOfStudy`: `NEW_STUDENT`, `YEAR_1` … `YEAR_5_PLUS` |
| Grade `"A-"`, `"B+"` | `A_MINUS`, `B_PLUS` |
| Category `"major-requirement"` | `MAJOR_REQUIREMENT` |
| Platform `"youtube"` | `YOUTUBE` |
| Course `title` | `name` |
| Term label `"Fall 2026"` / `"F26"` | `{ "term": "FALL", "year": 2026 }`. The frontend builds the label. |

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
  prerequisites: CourseRefDto[]
  corequisites: CourseRefDto[]
}

type TermRefDto = { term: Term; year: number }

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
  verified: boolean
  courses: CourseRefDto[]
}
```

---

## 1. Auth

### `POST /api/auth/signin` (register): EXISTS · public

Creates a **student** account and starts a session. Any `role` the client sends is ignored. (Despite the name, this route creates the account; `/login` signs in.)

The year of study isn't part of sign-up. The student picks it later, on the onboarding Transcript step (`PUT /api/me/year-of-study`).

**Request body**

```jsonc
{
  "name": "Maya Chen",              // trimmed, non-empty
  "email": "maya.chen@umich.edu",   // trimmed, lowercased
  "password": "atlas2026"           // 8+ characters, ≤ 72 bytes UTF-8 (frontend also requires a letter and a digit)
}
```

**Response `201`**

- Header: `Set-Cookie: refreshToken=…; HttpOnly; SameSite=Strict; Path=/api/auth`

```jsonc
{
  "data": {
    "user": UserDto,
    "accessToken": "eyJhbGciOi..."
  }
}
```

**Errors:** `400` (validation, with `details`) · `409` "Email is already registered" · `429`

---

### `POST /api/auth/login`: EXISTS · public

**Request body**

```jsonc
{ "email": "maya.chen@umich.edu", "password": "atlas2026" }
```

Only presence is checked here; the strength rules belong to registration.

**Response `200`:** same body and cookie as `/signin`.

**Errors:** `400` · `401` "Invalid email or password" (the same message for an unknown email) · `429`

---

### `POST /api/auth/refresh`: EXISTS · cookie

Rotates the session.

**Request:** no body; the `refreshToken` cookie is required.

**Response `200`:** a new `Set-Cookie: refreshToken=…`, plus:

```jsonc
{ "data": { "accessToken": "eyJhbGciOi..." } }
```

**Errors:** `401` when the cookie is missing, invalid, expired, revoked or reused.

---

### `POST /api/auth/logout`: EXISTS · cookie

Revokes the session and clears the cookie.

**Request:** no body; the cookie is optional.

**Response:** `204`, always, even if the cookie was already invalid.

---

## 2. Current user and onboarding

### `GET /api/me`: NEEDED · 🔒 any role

Loads the signed-in user when the app starts. The frontend uses it to:

- redirect by role (`/app` or `/admin`)
- resume onboarding at the right step after a refresh (today that progress is kept only in memory and sessionStorage)
- fill the sidebar and top bar

**Response `200`**

```jsonc
{
  "data": {
    "user": UserDto,
    // null for admins
    "profile": {
      "university": UniversityDto | null,
      "major": MajorDto | null,
      "yearOfStudy": YearOfStudy | null,
      "onboardingCompletedAt": "2026-10-20T18:02:11.000Z" | null
    } | null,
    // null for admins
    "onboarding": {
      "universitySelected": true,
      "catalogStatus": CatalogStatus | null,   // null until a university is selected
      "universityDocumentsUploaded": false,    // the student uploaded ≥ 1 catalog source
      "yearOfStudySelected": false,            // profile.yearOfStudy !== null
      "transcriptRequired": true,              // false only when yearOfStudy = NEW_STUDENT
      "transcriptUploaded": false,             // ≥ 1 StudentDocument of type TRANSCRIPT
      "completed": false                       // onboardingCompletedAt !== null
    } | null
  }
}
```

**Errors:** `401`

---

### `PUT /api/me/university`: NEEDED · 🔒 Student

Onboarding **University** step (`UniversityFinder.tsx`). It replaces the mocked `checkCatalogAvailability()`. The backend:

1. finds the university by name and country (normalizing case, accents and a leading "The", and matching `shortName`), or creates it
2. finds or creates the major under that university
3. saves both on the student's profile
4. reports whether a usable catalog already exists

If the student picks a different university than before, the old major is cleared.

**Request body:** the same rules as `universityStepSchema`.

```jsonc
{
  "name": "University of Michigan",  // 3–120
  "country": "United States",        // 2–60, letters only
  "city": "Ann Arbor",               // 1–80, letters only
  "major": "Computer Science"        // 2–100
}
```

**Response `200`**

```jsonc
{
  "data": {
    "university": UniversityDto,     // its name is the official one, which may differ from what was typed ("UBC")
    "major": MajorDto,
    "catalog": {
      "status": "AVAILABLE",         // CatalogStatus
      "title": "LSA Course Guide 2025–2026" | null,  // title of the newest completed source
      "source": "lsa.umich.edu" | null,             // hostname of that source
      "courseCount": 4180,           // courses across the university
      "majorCount": 112
    },
    "replaced": false                // true if this changed a previously selected university
  }
}
```

`catalog.status` decides the next screen: `AVAILABLE` skips university documents, while `UNAVAILABLE` and `PROCESSING` ask for documents.

**Errors:** `400` · `401` · `403` (admin)

---

### `POST /api/me/university/sources`: NEEDED · 🔒 Student

Onboarding **University documents** step. Uploads catalog or curriculum files for the student's university, creating `CourseMaterialSource` rows that the backend then processes asynchronously.

**Request:** `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `files` | File, repeated | 1–20 files; PDF, PNG, JPEG or WEBP; non-empty; ≤ 25 MB each; ≤ 150 MB total. The type is checked from the file's content, not only its extension. |

**Response `201`**

```jsonc
{
  "data": [
    {
      "id": "9a1c…",
      "title": "cs-curriculum-2025.pdf" | null,
      "sourceType": "PDF",              // SourceType
      "status": "PENDING",              // ProcessingStatus
      "errorMessage": null,
      "createdAt": "2026-10-23T09:14:00.000Z"
    }
  ]
}
```

**Errors:** `400` · `401` · `413` · `415` · `422` "Select your university first"

---

### `GET /api/me/university/sources`: NEEDED · 🔒 Student

Lists the processing status of the student's university sources. The frontend polls it every few seconds while any source is `PENDING` or `PROCESSING`.

**Response `200`:** the same item shape as the upload response.

```jsonc
{ "data": [ { "id", "title", "sourceType", "status", "errorMessage", "createdAt" } ] }
```

> Note: `CourseMaterialSource` has no `status` column. The backend derives it:
> - `FAILED` when `errorMessage` is set
> - `COMPLETED` when `lastProcessedAt` is set
> - `PROCESSING` when `lastFetchedAt` is set
> - `PENDING` otherwise
>
> A real column would be simpler.

---

### `PUT /api/me/year-of-study`: NEEDED · 🔒 Student

Onboarding **Transcript** step (`Transcript.tsx`, the "Year & transcript" tab). It saves the year the student selects there. The frontend calls it when the step is submitted, before any upload. A `NEW_STUDENT` has no courses on record, so for them this is the whole step and no transcript is uploaded.

The student can come back and change the year. Moving to or from `NEW_STUDENT` only changes `transcriptRequired`. Documents already uploaded are kept.

**Request body**

```jsonc
{ "yearOfStudy": "YEAR_2" }   // YearOfStudy
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

### `POST /api/me/documents`: NEEDED · 🔒 Student

Onboarding **Transcript** step, for students who aren't `NEW_STUDENT`. Uploads academic documents that the backend extracts asynchronously into `AcademicRecord` rows.

**Request:** `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `files` | File, repeated | Same limits as the university sources |
| `type` | `StudentDocumentType` | Optional; defaults to `TRANSCRIPT` |

**Response `201`**

```jsonc
{
  "data": [
    {
      "id": "4be0…",
      "type": "TRANSCRIPT",
      "fileName": "transcript-fall-2026.pdf",
      "mimeType": "application/pdf",
      "fileSize": 482113,
      "status": "PENDING",            // ProcessingStatus
      "errorMessage": null,
      "processedAt": null,
      "createdAt": "2026-10-23T09:20:00.000Z"
    }
  ]
}
```

**Errors:** `400` · `401` · `413` · `415`

---

### `GET /api/me/documents`: NEEDED · 🔒 Student

Lists the student's uploaded documents and their processing status (polled like the sources).

**Query**

| Param | Type | Notes |
|---|---|---|
| `type` | `StudentDocumentType` | Optional filter |

**Response `200`**

```jsonc
{ "data": [ StudentDocumentDto ] }  // same shape as the upload response
```

---

### `POST /api/me/onboarding/complete`: NEEDED · 🔒 Student

The **Complete** step's "Go to dashboard" action. It sets `onboardingCompletedAt`.

**Request:** no body.

**Response `200`:** the same `data` as `GET /api/me`.

**Errors:** `422` with one of these messages, matching the order of the onboarding guards:

- "Select your university and major first"
- "Select your year of study first"
- "Upload your transcript first" (when `transcriptRequired` and no `TRANSCRIPT` document exists)

---

## 3. Student academics

### `GET /api/me/academic-summary`: NEEDED · 🔒 Student

Everything the **Overview** dashboard shows. All of it is computed deterministically on the server from `AcademicRecord`, `Course`, `Major` and the latest `StudyPlan`. It replaces the module-level constants in `lib/academic/record.ts`.

**Response `200`**

```jsonc
{
  "data": {
    "student": {
      "name": "Omar Haddad",
      "university": UniversitySummaryDto,
      "major": MajorDto,
      "yearOfStudy": "YEAR_4"
    },
    "gpa": {
      "cumulative": 3.62 | null,              // null when nothing has been graded yet (new student)
      "changeSinceLastYear": 0.08 | null      // cumulative now minus cumulative excluding the last 2 terms
    },
    "credits": {
      "completed": 98,
      "inProgress": 16,
      "required": 128 | null,                 // Major.totalRequiredCredits
      "remaining": 30 | null
    },
    "graduation": {
      "progressPercent": 77 | null,           // completed / required
      "expected": { "term": "FALL", "year": 2027 } | null   // last semester of the latest plan
    },
    "currentTerm": {
      "term": "FALL",
      "year": 2026,
      "credits": 16,
      "courses": [
        {
          "recordId": "…",
          "course": CourseSummaryDto,
          "expectedGrade": "B_PLUS" | null    // AcademicRecord.expectedGrade
        }
      ]
    } | null,                                 // null when nothing is IN_PROGRESS
    "lastTerm": {
      "term": "SPRING",
      "year": 2026,
      "gpa": 3.71,
      "courses": [ { "course": CourseSummaryDto, "status": "COMPLETED", "grade": "A_MINUS" } ]
    } | null,
    // oldest first; feeds the GPA trend chart
    "termHistory": [
      { "term": "FALL", "year": 2023, "gpa": 3.41, "credits": 16 }
    ],
    // feeds the requirement progress bars
    "requirements": [
      {
        "category": "MAJOR_REQUIREMENT",
        "completedCredits": 52,
        "plannedCredits": 68                  // completed + in progress + planned in the latest plan
      }
    ]
  }
}
```

> FAILED attempts are excluded from GPA, matching the current `lib/gpa.ts`. The UI's week-of-term bar ("Week 8 of 15") has no data source, so it's left out and the frontend drops that UI.

---

### `GET /api/me/academic-records`: NEEDED · 🔒 Student

The student's records, flat. The **Semester plan** page uses it for completed semesters, and **Sources** uses it for failed attempts.

**Query**

| Param | Type | Notes |
|---|---|---|
| `status` | `AcademicRecordStatus` | Optional |
| `term` | `Term` | Optional |
| `year` | int | Optional |

**Response `200`:** ordered by `year`, then term (SPRING → SUMMER → FALL), then course code.

```jsonc
{
  "data": [
    {
      "id": "…",
      "course": CourseSummaryDto,
      "status": "FAILED",                 // AcademicRecordStatus
      "grade": "F" | null,                // null for IN_PROGRESS
      "expectedGrade": null,              // only used for IN_PROGRESS
      "term": "SPRING",
      "year": 2024
    }
  ]
}
```

---

### `GET /api/me/courses`: NEEDED · 🔒 Student

The **Courses** page: every course in the student's major, with the student's status for each. Filtering uses the page's URL params. A major has tens of courses, not thousands, so the list isn't paginated, and the frontend counts the filter chips locally.

**Query**

| Param | Type | Notes |
|---|---|---|
| `q` | string | Matches code, name or description |
| `category` | `CourseCategory` | Optional |
| `status` | `StudentCourseStatus` | Optional |

**Response `200`**

```jsonc
{
  "data": [
    {
      ...CourseDto,
      "prerequisites": [ { "id", "code", "name", "met": true } ],  // met = COMPLETED in the student's records
      "corequisites":  [ { "id", "code", "name", "met": false } ], // met = COMPLETED or IN_PROGRESS
      "status": "PLANNED",                 // StudentCourseStatus
      "statusDetail": {
        "grade": "A_MINUS" | null,         // COMPLETED / FAILED
        "term": "SPRING" | null,           // when it was or will be taken
        "year": 2027 | null
      }
    }
  ]
}
```

**Errors:** `422` "Select your major first"

---

### `GET /api/courses/:courseId`: LATER · 🔒 any role

A course details page (not built yet). It's also used when a course chip is clicked.

**Params:** `courseId` (uuid)

**Response `200`**

```jsonc
{
  "data": {
    ...CourseDto,
    "requiredFor": CourseRefDto[],        // courses that list this one as a prerequisite
    "resources": LearningResourceDto[],
    "studentStatus": { "status", "statusDetail" } | null   // null for admins
  }
}
```

**Errors:** `404`

---

## 4. Study plan

### `GET /api/me/study-plan`: NEEDED · 🔒 Student

The student's latest study plan, for the **Semester plan** page. The frontend merges it with the completed semesters from `/api/me/academic-records`, as `buildPlanTimeline()` does today.

**Response `200`**

```jsonc
{
  "data": {
    "id": "…",
    "name": "Study plan",
    "generatedAt": "2026-10-14T12:00:00.000Z",   // StudyPlan.createdAt
    "assumptions": ["You pass every Fall 2026 course.", "…"],
    "notes": ["…"],
    "semesters": [
      {
        "id": "…",
        "term": "SPRING",
        "year": 2027,
        "rationale": "Clears the systems sequence before…" | null,
        "credits": 15,
        "courses": [
          {
            "id": "…",                // StudyPlanCourse.id
            "status": "PLANNED",      // PlannedCourseStatus
            "course": CourseDto
          }
        ]
      }
    ],
    "totals": {
      "plannedCredits": 30,
      "creditsRequired": 128 | null,
      "meetsDegreeTotal": true | null   // completed + in progress + planned ≥ required
    },
    "expectedGraduation": { "term": "FALL", "year": 2027 }
  } | null   // null when no plan has been generated
}
```

---

### `POST /api/me/study-plan/generate`: NEEDED · 🔒 Student · AI

Generates a new plan through graduation. The AI proposes it, and the backend checks prerequisites, offered terms and credit limits before saving. The previous plan is kept, and the newest one becomes "the" plan. The route is slow (several seconds), so the frontend shows a loading state and uses a long timeout.

**Request body:** optional.

```jsonc
{ "maxCreditsPerSemester": 16 }   // optional, 12–18, default 16
```

**Response `201`:** the same `data` as `GET /api/me/study-plan`.

**Errors:** `422` "Select your major first" or "Your major has no courses yet" · `429` · `502` (AI provider failed)

---

### `PATCH /api/me/study-plan/courses/:planCourseId`: LATER · 🔒 Student

Marks a planned course as skipped, or restores it.

**Params:** `planCourseId` (uuid; must belong to the caller's plan, otherwise `404`)

**Request body**

```jsonc
{ "status": "SKIPPED" }   // PlannedCourseStatus
```

**Response `200`**

```jsonc
{ "data": { "id", "status", "course": CourseDto } }
```

---

## 5. What-if analysis

### `POST /api/me/what-if`: NEEDED · 🔒 Student · AI

Analyzes a scenario described in natural language, using the student's real record and plan. **Nothing is saved, and the record and plan aren't modified.** It replaces `simulation/what-if/mock-analyze.ts`.

**Request body**

```jsonc
{ "scenario": "What if I fail CS 3110 this semester?" }   // trimmed, 10–500 characters
```

**Response `200`:** `ScenarioResult`, which the frontend already defines in `src/types/what-if.ts`. In this route, labels are display strings (`"Spring 2027"`) and course references are codes, because the page only displays them.

```ts
type ScenarioResult = ScenarioAnalysis | UnclearScenario

type ScenarioAnalysis = {
  status: "ok"
  kind: "fail" | "grade-change" | "retake" | "add" | "move-earlier" | "drop" | "swap"
  headline: string                         // "Graduation moves one semester later"
  summary: string
  gpa: { label: string; current: number; scenario: number }
  credits: { label: string; current: number; scenario: number }
  graduation: { current: string; scenario: string; semestersDelta: number }  // "December 2027"
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
  message: string                          // "Which course do you mean?…"
  suggestions: string[]                    // example scenarios the student can click
}
```

An unclear scenario returns `200` with `status: "unclear"`, not an error.

**Errors:** `400` · `422` "Select your major first" · `429` · `502`

---

## 6. AI advisor

### `POST /api/me/advisor/chat`: NEEDED · 🔒 Student · AI · streaming

Streams the advisor's reply, grounded in the student's record and plan. The chat history isn't stored; the client sends it with each request. This matches `AdvisorService.streamReply(history, signal)` in `src/types/advisor.ts`. The frontend cancels a reply by aborting the request.

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

- `messages`: 1–20 items, oldest first, and the last item must have `role: "student"`.
- `role`: `"student"` or `"assistant"`.
- `content`: trimmed, 1–1000 characters for student messages. Assistant messages are capped at 8000.

**Response `200`:** `Content-Type: text/event-stream`

```
event: delta
data: {"text":"**CS 4410 Operating Systems** — 4 credits, "}

event: delta
data: {"text":"offered Spring only."}

event: done
data: {}
```

If the AI fails partway through, the stream sends `event: error` with `data: {"message":"The advisor is unavailable right now."}` and then closes. The reply may contain Markdown (bold, lists).

**Errors before the stream starts** are sent as normal JSON: `400` · `401` · `422` · `429`

---

## 7. Learning resources and quizzes (Sources page)

### `GET /api/me/recommendations`: NEEDED · 🔒 Student

The "Focus courses" sections:

- **failed**: courses with a FAILED record
- **difficult**: IN_PROGRESS courses whose `expectedGrade` is B+ or lower, lowest first

Each comes with matching resources. This replaces `lib/sources/recommendations.ts`.

**Response `200`**

```jsonc
{
  "data": {
    "failed": [
      {
        "course": CourseSummaryDto,
        "why": "It's a prerequisite for CS 3110 Data Structures, so a solid foundation pays off now.",
        "attempt": { "term": "SPRING", "year": 2024, "grade": "F", "retakenIn": { "term": "FALL", "year": 2024 } | null },
        "resources": LearningResourceDto[]
      }
    ],
    "difficult": [
      {
        "course": CourseSummaryDto,
        "why": "You need it for CS 4410 next semester.",
        "expectedGrade": "B",
        "resources": LearningResourceDto[]
      }
    ]
  }
}
```

---

### `POST /api/resources/search`: NEEDED · 🔒 Student · AI

The AI-powered resource search. It replaces `simulation/sources/search.ts`. Results come from stored `LearningResource` rows, plus new ones the AI finds, which are saved with `verified: false`.

**Request body:** the same rules as `resourceSearchSchema`.

```jsonc
{
  "query": "CS 3110",                          // trimmed, 2–100: a course code, course name or topic
  "goal": "I keep getting lost in recursion",  // optional, ≤ 300
  "platforms": ["YOUTUBE", "COURSERA"]         // ResourcePlatform[], at least 1
}
```

**Response `200`**

```jsonc
{
  "data": {
    "results": LearningResourceDto[],          // best match first; may be empty
    "matchedCourse": CourseSummaryDto | null   // the course in the student's major the query was recognized as
  }
}
```

**Errors:** `400` · `429` · `502`

---

### `POST /api/quizzes`: NEEDED · 🔒 Student · AI

Generates a practice quiz for a resource, or for a course. **The quiz isn't stored.** Scoring happens on the client, so the answers are included. This replaces `lib/sources/quiz.ts`.

**Request body:** send exactly one of `resourceId` or `courseId`.

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
    "questions": [
      {
        "id": "q1",
        "prompt": "What is the worst-case time complexity of quicksort?",
        "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],   // exactly 4
        "answer": 2,                         // index into options
        "explanation": "When the pivot is always the smallest or largest element…"
      }
    ]
  }
}
```

**Errors:** `400` · `404` (resource or course) · `422` "Not enough material to build a quiz" · `429` · `502`

---

## 8. Admin

Every route in this section is **🔒 Admin**.

### `GET /api/admin/stats`: NEEDED

The admin **Dashboard**: stat tiles, the registrations chart and the catalog-coverage bar.

**Query**

| Param | Type | Default | Notes |
|---|---|---|---|
| `months` | int 1–24 | `8` | How many months of registrations to return, ending with the current month |

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
    // oldest first, with zero-filled months
    "registrationsByMonth": [ { "month": "2026-03", "count": 4 } ],
    "universitiesByCatalogStatus": { "AVAILABLE": 9, "PROCESSING": 2, "UNAVAILABLE": 4 },
    "sourcesByStatus": { "PENDING": 3, "PROCESSING": 1, "COMPLETED": 41, "FAILED": 2 }
  }
}
```

---

### Universities

```ts
type AdminUniversityDto = UniversityDto & {
  createdAt: string
  updatedAt: string
  majorCount: number
  courseCount: number
  studentCount: number
  catalogStatus: CatalogStatus
}
```

#### `GET /api/admin/universities`: NEEDED

**Query:** `page`, `pageSize`, `q` (matches name, shortName, city or country), `country` (optional), `catalogStatus` (optional `CatalogStatus`)

**Response `200`**

```jsonc
{ "data": AdminUniversityDto[], "meta": { "page", "pageSize", "total" } }
```

#### `GET /api/admin/universities/:universityId`: NEEDED

The university details sheet.

**Params:** `universityId` (uuid)

**Response `200`**

```jsonc
{
  "data": {
    ...AdminUniversityDto,
    "majors": [ { ...MajorDto, "courseCount": 42, "studentCount": 12 } ],
    "sources": [ { "id", "title", "url", "sourceType", "status", "errorMessage", "lastProcessedAt", "createdAt" } ]
  }
}
```

**Errors:** `404`

#### `POST /api/admin/universities`: NEEDED

**Request body:** the same rules as `adminUniversitySchema`.

```jsonc
{
  "name": "University of Michigan",     // 3–120
  "shortName": "U-M" | null,            // ≤ 12
  "country": "United States",           // 2–60, letters only
  "city": "Ann Arbor",                  // 1–80, letters only
  "website": "https://umich.edu" | null,  // http(s) URL
  "catalogYear": "2025–26" | null       // /^\d{4}[–-]\d{2}$/
}
```

The form sends `""` for empty optional fields, and the backend stores `""` as `null`.

**Response `201`**

```jsonc
{ "data": AdminUniversityDto }
```

**Errors:** `400` · `409` "A university with this name already exists in this country"

#### `PATCH /api/admin/universities/:universityId`: NEEDED

**Request body:** any subset of the POST fields. Omitted fields are left unchanged, and `null` clears an optional field.

**Response `200`**

```jsonc
{ "data": AdminUniversityDto }
```

**Errors:** `400` · `404` · `409`

#### `DELETE /api/admin/universities/:universityId`: NEEDED

Deletes the university along with its majors, courses and sources. Student profiles that pointed to it are set to `null`.

**Response:** `204`

**Errors:** `404` · `409` "Courses at this university are used in student records" (`AcademicRecord.course` is `onDelete: Restrict`)

---

### Majors

The admin course form needs a major to attach a course to, since `Course.majorId` is required. The frontend currently attaches courses to a university and will add a major select.

#### `GET /api/admin/universities/:universityId/majors`: NEEDED

**Response `200`**

```jsonc
{ "data": [ { ...MajorDto, "courseCount": 42, "studentCount": 12 } ] }
```

#### `POST /api/admin/universities/:universityId/majors`: NEEDED

**Request body**

```jsonc
{
  "name": "Computer Science",       // 2–100
  "degreeType": "BACHELOR",         // DegreeType, default BACHELOR
  "totalRequiredCredits": 128 | null  // int 1–300
}
```

**Response `201`**

```jsonc
{ "data": MajorDto }
```

**Errors:** `400` · `404` (university) · `409` "This major already exists at this university"

#### `PATCH /api/admin/majors/:majorId`: NEEDED

**Request body:** any subset of the POST fields.

**Response `200`**

```jsonc
{ "data": MajorDto }
```

**Errors:** `400` · `404` · `409`

#### `DELETE /api/admin/majors/:majorId`: NEEDED

**Response:** `204`

**Errors:** `404` · `409` (its courses are used in student records)

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

#### `GET /api/admin/courses`: NEEDED

The admin **Courses** table. `/admin/courses?university=<id>` is a link the UI already uses.

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

#### `POST /api/admin/courses`: NEEDED

**Request body:** the same rules as `createCourseSchema`, with the university replaced by the major.

```jsonc
{
  "majorId": "…",                         // uuid
  "code": "CS 3110",                      // normalized server-side to "CS 3110"; /^[A-Z]{2,5} \d{3,4}[A-Z]?$/
  "name": "Data Structures & Algorithms", // 3–100 (the frontend field is `title`)
  "description": "Lists, trees, hash tables…",  // 20–400
  "credits": 4,                           // int 0–8
  "category": "MAJOR_REQUIREMENT",        // CourseCategory
  "offeredTerms": ["FALL", "SPRING"],     // Term[], may be empty
  "prerequisites": ["CS 1120", "MATH 2310"],  // course codes in the same major
  "corequisites": []                      // course codes in the same major
}
```

The backend resolves the requisite codes to course ids within the same major. It sets `source = ADMIN` and `updatedById` to the caller.

**Response `201`**

```jsonc
{ "data": AdminCourseDto }
```

**Errors**

- `400`, with `details` paths `prerequisites` / `corequisites` for: an unknown code ("CS 9999 isn't in this major's courses"), a malformed code, or a course that requires itself
- `404` (major)
- `409` "CS 3110 already exists in this major"

#### `PATCH /api/admin/courses/:courseId`: NEEDED

**Request body:** any subset of the POST fields. If `prerequisites` or `corequisites` is sent, it **replaces** that list. The backend sets `updatedById` to the caller.

**Response `200`**

```jsonc
{ "data": AdminCourseDto }
```

**Errors:** `400` · `404` · `409`

#### `DELETE /api/admin/courses/:courseId`: NEEDED

**Response:** `204`

**Errors:** `404` · `409` "This course is used in student records or plans"

---

### Students (read-only)

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
  stage: "PROCESSED" | "UPLOADED" | "NONE"       // has records / has documents only / nothing
  academic: {
    gpa: number | null
    creditsCompleted: number
    creditsRequired: number | null
    expectedGraduation: TermRefDto | null
  } | null                                       // null while stage !== "PROCESSED"
  documents: { transcripts: number }
}
```

The admin side never returns transcript contents or individual grades, only these summary values.

#### `GET /api/admin/students`: NEEDED

**Query:** `page`, `pageSize`, `q` (matches name or email), `universityId` (optional), `stage` (optional)

**Response `200`**

```jsonc
{ "data": AdminStudentDto[], "meta": { "page", "pageSize", "total" } }
```

#### `GET /api/admin/students/:studentId`: NEEDED

The student details sheet.

**Response `200`**

```jsonc
{
  "data": {
    ...AdminStudentDto,
    "onboardingCompletedAt": "…" | null,
    "documentsList": [ { "id", "type", "fileName", "status", "createdAt" } ]
  }
}
```

**Errors:** `404`

---

## 9. Route index

| Method | Path | Auth | Status |
|---|---|---|---|
| POST | `/api/auth/signin` | public | EXISTS |
| POST | `/api/auth/login` | public | EXISTS |
| POST | `/api/auth/refresh` | cookie | EXISTS |
| POST | `/api/auth/logout` | cookie | EXISTS |
| GET | `/api/me` | any | NEEDED |
| PUT | `/api/me/university` | student | NEEDED |
| POST | `/api/me/university/sources` | student | NEEDED |
| GET | `/api/me/university/sources` | student | NEEDED |
| PUT | `/api/me/year-of-study` | student | NEEDED |
| POST | `/api/me/documents` | student | NEEDED |
| GET | `/api/me/documents` | student | NEEDED |
| POST | `/api/me/onboarding/complete` | student | NEEDED |
| GET | `/api/me/academic-summary` | student | NEEDED |
| GET | `/api/me/academic-records` | student | NEEDED |
| GET | `/api/me/courses` | student | NEEDED |
| GET | `/api/courses/:courseId` | any | LATER |
| GET | `/api/me/study-plan` | student | NEEDED |
| POST | `/api/me/study-plan/generate` | student | NEEDED |
| PATCH | `/api/me/study-plan/courses/:planCourseId` | student | LATER |
| POST | `/api/me/what-if` | student | NEEDED |
| POST | `/api/me/advisor/chat` (SSE) | student | NEEDED |
| GET | `/api/me/recommendations` | student | NEEDED |
| POST | `/api/resources/search` | student | NEEDED |
| POST | `/api/quizzes` | student | NEEDED |
| GET | `/api/admin/stats` | admin | NEEDED |
| GET / POST | `/api/admin/universities` | admin | NEEDED |
| GET / PATCH / DELETE | `/api/admin/universities/:universityId` | admin | NEEDED |
| GET / POST | `/api/admin/universities/:universityId/majors` | admin | NEEDED |
| PATCH / DELETE | `/api/admin/majors/:majorId` | admin | NEEDED |
| GET / POST | `/api/admin/courses` | admin | NEEDED |
| PATCH / DELETE | `/api/admin/courses/:courseId` | admin | NEEDED |
| GET | `/api/admin/students` | admin | NEEDED |
| GET | `/api/admin/students/:studentId` | admin | NEEDED |

### Not included yet (no screen needs them today)

- A transcript extraction review step (edit or confirm extracted records before they're saved), with routes like `GET /api/me/documents/:id/extraction` and `POST /api/me/academic-records` (bulk). Add them when the review screen is built.
- Admin management of learning resources and catalog sources (`/api/admin/learning-resources`, `POST /api/admin/sources/:id/retry`).
- An AI-generated text for the Overview "advisor insight" card. It's hardcoded today, and could later be one more field on `/api/me/academic-summary`.
