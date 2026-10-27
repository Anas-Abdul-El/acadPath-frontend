# AcadPath frontend vs. database: compatibility audit

Audit date: 2026-10-21. Read-only audit of `frontend/` against the 13-model schema described for the backend.

**Important:** `backend/prisma/schema.prisma` has only the `generator` and `datasource` blocks. None of the 13 models are written yet. Every field-level mapping below is based on the model descriptions, not real Prisma code. Anything that depends on an exact field name, nullability or constraint is marked **(unverified)**.

---

## A. Executive summary

**Verdict: partially compatible.** Most of the UI can be kept, but the data layer underneath it can't connect as it is.

**What already works in its favour:**
- The AI and slow features already sit behind typed services that support cancellation and handle loading and error states: `simulation/onboarding/university-catalog.ts`, `simulation/what-if/mock-analyze.ts`, `simulation/sources/search.ts`, `lib/sources/quiz.ts`, and the advisor service in `types/advisor.ts`.
- Most of the numbers on screen can be calculated from `AcademicRecord`, `Course`, `CoursePrerequisite` and the three `StudyPlan*` models: GPA, credits, term GPA, the plan timeline, prerequisite gaps, recommendations and admin counts.
- What-if, quizzes, chat and uploads are already temporary, which matches the intended design.

**Why it is only partial:**
1. **The student app shows one hardcoded student.** Overview, Plan, Courses, Sources, the sidebar and the top bar all import constants from `mock/academic/*`. Those constants are computed once when the module loads, not per user. Every account sees "Omar / Northfield / B.Sc. CS", no matter what the student entered during onboarding. Northfield isn't even in the finder's directory (`mock/universities.ts`).
2. **There's no Major anywhere, and courses have no IDs.** Registration takes the major as free text. Admin courses are attached to a university instead of a major. Every course reference across the app is a code string (`getCourse(code)` throws if the code is unknown).
3. **The UI relies on data the 13 models don't hold:**
   - course category
   - the degree's total required credits
   - corequisites
   - which terms a course is offered
   - the current grade standing for in-progress courses
   - the week-of-term calendar
   - university info status, short name and catalog year
   - learning-resource metadata (duration, difficulty, topics, format)
4. **Some required flows don't exist yet:**
   - a review-and-confirm step for extracted transcript and catalog data
   - a processing-status view for catalog sources
   - generating or activating a study plan
   - real auth with roles (the admin console has no guard at all)

---

## B. Page-by-page audit

| Page / Component | Current behavior | Data required | Model(s) | Compat. | Required changes |
|---|---|---|---|---|---|
| Landing: `pages/landing/Landing.tsx`, `landing/preview/dashboard-preview.tsx`, `features/feature-vignettes.tsx` | Static marketing data from `mock/student-preview.ts` | None | — | ✅ | None. It can stay static. |
| Sign-up: `pages/auth/Register.tsx` | RHF + Zod. `mock-auth.register` always succeeds. Account saved to sessionStorage. | name, major, year, email, password | User, Session, StudentProfile | ⚠️ | Move major to after the university step and make it a Major selection. Map the year field to `currentSemester`. Handle 409 and other errors. Whether User has `name` is (unverified). |
| Sign-in: `pages/auth/Login.tsx` | Mock. Always goes to `/app`. Links openly to the admin console. | email, password | User, Session | ⚠️ | Redirect by role and by whether onboarding is complete. Add error states. |
| University finder: `pages/onboarding/UniversityFinder.tsx` | Free-text name/country/city matched against the mock directory. Result is binary: available or unavailable. | University id, catalog availability, counts | University, CourseMaterialSource, Major, Course | ⚠️ | Pick an existing `University.id` (search), or create one. The result needs an id. There is no major step. |
| University documents: `pages/onboarding/UniversityDocuments.tsx` | Files kept in memory. Upload progress is simulated. Nothing is sent. | Files to sources | CourseMaterialSource | ⚠️ | Real upload. Show PENDING/PROCESSING/COMPLETED/FAILED status and errors. Add review of extracted courses. |
| Transcript: `pages/onboarding/Transcript.tsx` | Same pattern as university documents | Extracted records | AcademicRecord (after confirmation) | ❌ | The extraction review/confirm screen is missing. Today the files go nowhere. |
| Complete: `pages/onboarding/Complete.tsx` | Summary from context. Promises a review step that doesn't exist. | Profile summary | StudentProfile | ⚠️ | Depends on the review flow and a persisted profile. |
| Overview: `pages/overview/Overview.tsx` | Module-level constants from `lib/academic/record.ts`. Only the first name comes from the account. | GPA, credits, terms, plan | AcademicRecord, Course, StudyPlan*, Major | ⚠️ | Needs an async data layer. Required credits, category and week-of-term have no source. The insight text is hardcoded (line 165). |
| Semester plan: `pages/semester-plan/SemesterPlan.tsx`, `plan/semester-card.tsx` | `buildPlanTimeline()` merges the record with `generatedPlan` at module load | Past records + plan semesters | StudyPlan, StudyPlanSemester, StudyPlanCourse, AcademicRecord | ⚠️ | The structure fits. No generate/activate actions. "Meets degree total" (line 73) and `expectedGraduation` are hardcoded. SKIPPED isn't shown. |
| What-if: `pages/what-if/WhatIf.tsx`, `simulation/what-if/mock-analyze.ts` | Keyword parser plus a greedy scheduler | Record, plan, prerequisites, offered terms, standing | Same, read-only | ✅ temporary | Service contract `types/what-if.ts` is ready. Scheduling depends on offered terms and standing, which aren't in the schema. |
| Courses: `pages/courses/Courses.tsx`, `courses/course-card.tsx` | Client-side filter over `courseCatalog`. Status from record and plan. | Courses for the student's major + per-course status | Course, CoursePrerequisite, AcademicRecord, StudyPlanCourse | ⚠️ | Category, offered terms and corequisites have no source. FAILED shows as "Not taken". **No course-details route exists.** |
| Sources: `pages/sources/Sources.tsx`, `resource-search.tsx`, `resource-dialog.tsx`, `lib/sources/recommendations.ts` | Recommendations computed at module load. Simulated search. Quizzes from a question bank. | Failed and difficult courses, resources | LearningResource, AcademicRecord, Course | ⚠️ | Resource shape doesn't match. "Difficult" depends on standing. Quizzes can stay temporary. |
| Advisor: `pages/advisor/Advisor.tsx`, `advisor/advisor-chat-provider.tsx` | In-memory chat with a streaming service interface | Server-side student context | none (temporary) | ✅ | Needs a streaming endpoint only. |
| Admin dashboard: `pages/admin/Dashboard.tsx` | Reducer seeded from mocks | Counts, registrations | User, StudentProfile, University, Course, CourseMaterialSource | ⚠️ | Info status and "AI-captured" have no fields. No admin guard. |
| Admin universities: `pages/admin/Universities.tsx`, `university/university-form.tsx`, `university-details.tsx` | In-memory CRUD | University fields | University | ⚠️ | shortName, catalogYear and status can't be stored. No way to manage majors or sources. |
| Admin courses: `pages/admin/Courses.tsx`, `courses/course-form.tsx` | In-memory CRUD. Course attached to a university. Prerequisites stored as codes. | Course + major + prerequisites | Course, CoursePrerequisite, Major | ❌ | No major field. Category, corequisites, `capturedByAi` and `updatedBy` can't be stored. |
| Admin students: `pages/admin/Students.tsx`, `student/student-details.tsx` | Read-only list | Profile + derived academics | User, StudentProfile, AcademicRecord, StudyPlan, Session | ⚠️ | profileStatus, transcript count and lastActiveAt are only partly derivable. |
| **Missing** | — | — | — | — | Admin Major management, admin CourseMaterialSource management, a course-details page, a student academic-record review/edit page |

---

## C. Forms and input mapping

| Form | Field (current name · type · rules) | DB model.field | Status |
|---|---|---|---|
| Register | `name` · text · 2–100, required | User.name | **(unverified)** that User has a name |
| Register | `major` · text · 2–100, required | StudentProfile.majorId (FK) | ❌ Free text can't fill an FK. Also, a major belongs to a university that hasn't been chosen yet at this point. |
| Register | `academicYear` · select `new`, `year-1`…`year-5-plus` | StudentProfile.currentSemester | ❌ Lossy: "Third year" means semester 5 or 6. `new` maps to 1. |
| Register | `email` · email | User.email | ✅ Backend must check uniqueness (409) |
| Register | `password` · ≥8, a letter and a digit | User.passwordHash (hashed server-side) | ✅ Never return the hash |
| Register | role (not collected) | User.role = STUDENT by default | ✅ |
| Sign-in | `email`, `password` | Session (refresh token) | ✅ Needs 401 handling |
| Finder | `name` 3–120, `country` 2–60 letters only, `city` 1–80 letters only | University.name / country / city | ⚠️ Storable, but should resolve to an existing id. Free text creates duplicates, so the backend must dedupe. |
| Uni docs | `files[]` · PDF/PNG/JPG/WEBP, ≤25 MB each, ≤20 files, ≤150 MB total | CourseMaterialSource {universityId, url, sourceType PDF or IMAGE, status PENDING} | ⚠️ Needs storage to produce `url`. DOCX is in the enum but not accepted by the UI. The client `simulating/ready` state has no DB meaning. |
| Transcript | `files[]` · same rules | no model; extracted rows go to AcademicRecord {courseId, status, grade, semester, academicYear} | ❌ Confirmation step missing. Unmatched course codes need handling. |
| Course search | URL params `q`, `category`, `status` | Course query | ⚠️ `category` has no field |
| What-if | `scenario` · 10–500 chars | none (temporary) | ✅ |
| Resource search | `query` 2–100, `goal` ≤300 optional, `platforms[]` youtube/udemy/coursera, min 1 | LearningResource.provider filter (+ live AI search) | ⚠️ The frontend calls this `platform`; the DB calls it `provider` |
| Quiz setup | count 5/10/15 | none | ✅ |
| Advisor | message 1–1000 | none | ✅ |
| Admin university | `name`, `country`, `city`, `website` (https URL, optional) | University.* | ✅ |
| Admin university | `shortName` ≤12, `catalogYear` "2025–26", `status` verified/ai-captured/missing | — | ❌ Not in the schema |
| Admin course | `universityId` (select) | Course.majorId (via Major.universityId) | ❌ Needs a major select |
| Admin course | `code` (regex, normalized, unique per university) | Course.code | ⚠️ Uniqueness should be per major, enforced by the backend |
| Admin course | `title` 3–100 | Course.name | ✅ Rename only |
| Admin course | `description` 20–400 | Course.description | ✅ |
| Admin course | `credits` int 0–8 | Course.credits | ✅ |
| Admin course | `category` enum (4 values) | — | ❌ Not in the schema |
| Admin course | `prerequisites` (comma-separated codes) | CoursePrerequisite rows (code → id) | ⚠️ Needs code-to-id resolution on the backend |
| Admin course | `corequisites` (comma-separated codes) | — | ❌ Unless CoursePrerequisite has a type **(unverified)** |

**Fields the schema has that the frontend needs but doesn't collect:** StudentProfile.majorId and currentSemester; Major (name, degreeType), which no screen uses; StudyPlan.status; StudyPlanCourse.status SKIPPED; CourseMaterialSource.status and error; AcademicRecord.academicYear.

---

## D. Charts and calculations

| Visualization (file) | Source today | DB fields needed | Calculation | Can it be populated? |
|---|---|---|---|---|
| Cumulative GPA tile (`Overview.tsx`) | Calculated from mock (`record.ts` `cumulativeGpa`) | AcademicRecord.grade/status, Course.credits | Σ(points × credits) / Σ credits, using `lib/gpa.ts` | ✅ The grade type is (unverified). The repeat policy decides whether FAILED attempts count; today they're excluded. |
| "±x since last year" | Calculated; assumes 2 terms per year | + semester, academicYear ordering | GPA now minus GPA excluding the last 2 terms | ✅ Needs a sortable term key |
| Credits completed / remaining | Calculated plus hardcoded `creditsRequired = 128` | Course.credits; **degree total** | Σ completed credits; required − completed | ⚠️ The total isn't in the schema |
| Current semester tile + week progress bar | Hardcoded `week: 8, weeks: 15` | — | — | ❌ No term calendar. The "credits enrolled" part works (Σ IN_PROGRESS). |
| Graduation progress % | Calculated / 128 | degree total | completed / required | ⚠️ Blocked by the total |
| Term GPA line chart (`gpa-trend-plot.tsx`, Recharts) | Calculated from mock terms | AcademicRecord grouped by (academicYear, semester) | GPA per term and credits per term | ✅ The Y axis is fixed to `[3, 4]` and clips lower GPAs. The 3.5 Dean's List line is hardcoded. |
| Degree requirement bars (`requirement-progress.tsx`) | Calculated per category; "required" = credits in the student's own plan | **Course.category** | Completed vs. planned credits per category | ❌ Blocked by category. Targets are already derived from the plan, so no per-category target field is needed. |
| Last semester list | Mock | Latest term's records | Filter | ✅ |
| Plan timeline + 4 stat tiles (`SemesterPlan.tsx`) | Module-level `buildPlanTimeline()` | AcademicRecord + StudyPlanSemester/Course + Course.credits | Σ credits per semester; graduation = last semester's label | ✅ except "/ 128" and the hardcoded "December 2027" |
| Semester card prerequisite and requirement columns | Mock | CoursePrerequisite; category | — | Prerequisites ✅, requirement ❌ |
| Course-card prerequisite "met" chips | Calculated | AcademicRecord COMPLETED | `courseStatus(pre)` | ✅ |
| What-if impact tiles, plan comparison, comparison table | Calculated by the service | Record, plan, prerequisites, **offered terms**, standing | Re-scheduling and GPA projection | ✅ temporary. Accuracy depends on offered terms and standing. |
| Quiz score ring | Client-side | none | correct / total | ✅ temporary |
| Admin registrations bar chart (`registrations-plot.tsx`) | Mock `registeredAt`; window fixed to Mar–Oct 2026 | User.createdAt **(unverified)**, role | Count per month | ✅ The range and the "in September" label (`Dashboard.tsx:68`) are hardcoded |
| Admin info-coverage bar | Mock `status` | — | Count by status | ❌ Only derivable from CourseMaterialSource, or drop it |
| Admin stat tiles | Mock | User, University, Course counts | count | ✅ except the "AI-captured" count |
| Admin student academic summary | Mock `academic` | Record, plan, degree total | GPA, credits, graduation | ⚠️ The total is missing |
| Landing preview charts | Static mock | — | — | ✅ Keep static |

---

## E. Type and data-flow mismatches

1. **`CatalogCourse`** (`mock/academic/course-catalog.ts`)
   - Has no `id` and no `majorId`.
   - `title` should become `name`.
   - `prerequisites: string[]` holds codes, not relation ids.
   - `category`, `corequisites` and `offered` have no schema fields.
2. **Identity by code.** `lib/academic/catalog.ts` `getCourse` throws on an unknown code. Real records that reference a course outside the loaded catalog would crash a page. React keys use `course.code`.
3. **`CompletedTerm{id, label, shortLabel, courses[{code, grade}]}`** (`mock/academic/student-record.ts`) vs. flat AcademicRecord rows.
   - Records need grouping, a "Fall 2023" / "F23" label, and an ordering. Fall 2023 and Spring 2024 share the academic year 2023–24.
   - The semester field's type is (unverified).
4. **`failedAttempts`** is a separate array. In the DB these become FAILED rows, and `retakenIn` can be derived. This requires several records per (student, course), so there must be no unique constraint on that pair **(unverified)**.
5. **`currentTerm`**: the `week`, `weeks`, `courses[].detail` and `courses[].standing` fields have nothing to map to.
6. **Status enums.**
   - `StudentCourseStatus` (`lib/academic/record.ts`) uses `completed | in-progress | planned | not-taken`. It has no FAILED.
   - `PlanCourseStatus` (`lib/academic/plan.ts`) uses `completed | current | planned | remaining`. It has no SKIPPED, and "remaining" is just PLANNED in a later semester.
   - Frontend values are kebab-case; Prisma enums are SCREAMING_CASE.
7. **`GeneratedPlan{generatedAt, model, assumptions, notes, futureSemesters[{id, label, courses: string[], rationale}]}`** (`mock/academic/semester-plan.ts`)
   - Storage for rationale and notes is (unverified).
   - `expectedGraduation` is a separate constant.
8. **`studentProfile`** mock
   - `advisor` and `catalogYear` aren't in the schema.
   - `program` is a display string. It should be built from Major.degreeType plus Major.name.
   - `year` doesn't match `currentSemester`.
9. **`Account`** (`simulation/auth/mock-auth.ts`)
   - Has no `id`, no `role` and no profile.
   - It lives in sessionStorage under `acadpath:onboarding`.
10. **`UniversitySelection = {name, country, city}`** has no id. `CatalogCheckResult.title` isn't in the schema. Its status is binary, while SourceStatus has four states.
11. **`AdminUniversity`**: the id is a slug (`"umich"`). `shortName`, `status` and `catalogYear` can't be stored. `addedAt` maps to `createdAt`.
12. **`AdminCourse`**
    - Uses `universityId` instead of a major.
    - `updatedBy` is a free string ("You (admin)", "Catalog import", "AcadPath AI").
    - `capturedByAi` has no field.
    - ids are built as `${universityId}-${code}` (`mock/admin/courses.ts:29`, `pages/admin/Courses.tsx:81`).
13. **`AdminStudent`**
    - The id is `"stu-1001"` and `program` is a string.
    - The "in-review" `profileStatus` can't be derived because uploaded documents aren't stored.
    - `documents.transcripts` can't be populated.
14. **`LearningResource`** (`mock/sources/resources.ts`)
    - The frontend's `platform` is likely what the DB calls `provider`.
    - The frontend's `provider` means the instructor or channel, a different meaning.
    - `format` is a free string, while the DB has a `ResourceType` enum.
    - `courseCodes[]` links one resource to many courses; the DB likely allows one course **(unverified)**.
    - `duration`, `difficulty`, `topics`, `quizTopic` and `verified` have no fields.
15. **Nullability.** The frontend uses optional `?` (undefined). Prisma returns `null`, so types need `| null`. This affects shortName, website, the grade on IN_PROGRESS rows, and `catalog: null`.
16. **Fixed dates.**
    - `MOCK_NOW = 2026-10-16` (`lib/admin/format.ts:2`)
    - `registrationsByMonth` is hardcoded to Mar–Oct (`lib/admin/selectors.ts:26`)
    - What-if semester labels start at 2027 (`mock-analyze.ts:79`)
17. **Data computed once at import time:**
    - `lib/academic/record.ts`
    - `SemesterPlan.tsx:16-28`
    - `Overview.tsx:42-44`
    - `Sources.tsx:11-12`
    - `mock-analyze.ts:133-138`

    None of this can become per-user or async without hooks or queries that have loading and error states.
18. **Data held only in the browser:**
    - account, university and catalog in sessionStorage
    - files and the "submitted" flags in memory, so a refresh mid-onboarding bounces the student back a step
    - admin state in `useReducer`, which resets on refresh
    - chat in memory
19. **Places that assume success:**
    - `Register.tsx:39-43` and `Login.tsx:30-34` have no try/catch.
    - Admin save/delete dispatches and then shows a success toast immediately (`pages/admin/Courses.tsx:77-109`, `Universities.tsx`).
    - `submitUniversityDocs` and `submitTranscript` only flip flags.
    - Already handled well: the university finder, what-if, resource search, quiz and advisor.
20. **Pages that crash when a new student has no data.** Onboarding explicitly supports first-term students, so this will happen with real data.
    - `gpa-trend-chart.tsx:16` reads `data[0].term`.
    - `Overview.tsx:43,183` reads `lastTerm.label`.
    - `SemesterPlan.tsx:41,83,138` read `timeline[0]`, `upcoming[0]` and `completed[0]`.
21. **Auth guards.** `components/layouts/admin-layout.tsx` has no guard at all. `app-layout.tsx` only checks that an account exists; it doesn't check the role or whether onboarding is complete.
22. **API client.** `axios` is installed but nothing uses it. There's no API client, no auth interceptor and no error normalizer.

---

## F. Missing backend contracts

Shared error format: `{ error: { code, message, fields? } }`, with status codes 401, 403, 404, 409, 413, 415, 422, 429 and 5xx. Every page that's synchronous today needs skeleton, empty and error states.

### Essential: persistence and integration

| Endpoint | Request | Response |
|---|---|---|
| `POST /auth/register` | `{email, password, name?}` | `201 {user: {id, email, name, role}, accessToken}` + httpOnly refresh cookie. Errors: 409, 422 |
| `POST /auth/login` | `{email, password}` | Same as register. Error: 401 |
| `POST /auth/refresh` | cookie | `{accessToken}`. 401 sends the user to sign-in |
| `POST /auth/logout` | cookie | `204`, revokes the Session |
| `GET /me` | — | `{id, email, name, role, profile: {id, university, major: {id, name, degreeType}, currentSemester} \| null}` |
| `GET /universities?q=` | — | `[{id, name, country, city, website, courseCount, majorCount, hasCompletedSource}]` |
| `POST /universities` | `{name, country, city}` | `201`, or `409 {existing}` |
| `GET /universities/:id/majors` | — | `[{id, name, degreeType, courseCount}]` |
| `PUT /me/profile` | `{universityId, majorId, currentSemester}` | profile |
| `POST /universities/:id/sources` | multipart files, or `{url}` | `[{id, sourceType, status: "PENDING"}]`. Errors: 413, 415 |
| `GET /universities/:id/sources` (polled) | — | `[{id, url, sourceType, status, error, createdAt}]` |
| `POST /me/transcript/extract` | multipart | `{records: [{courseId \| null, rawCode, rawTitle, status, grade, semester, academicYear}], unmatched: [...]}`. Not persisted; the file is discarded. |
| `POST /me/academic-records/bulk` | confirmed records | saved records |
| `GET /me/academic-records`, `PATCH`/`DELETE /me/academic-records/:id` | — | `[{id, course: {id, code, name, credits}, status, grade, semester, academicYear}]` |
| `GET /majors/:id/courses?q=` | — | `[{id, code, name, description, credits, prerequisites: [{id, code}]}]` |
| `GET /courses/:id` | — | course + prerequisites + learning resources |
| `GET /me/study-plans/active` | — | `{id, status, semesters: [{id, semester, academicYear, order, courses: [{id, status, course}]}]}` |
| `POST /me/study-plans/generate` | — | DRAFT plan. AI, so this may be slow; use 202 + polling |
| `PATCH /me/study-plans/:id`, `PATCH /me/study-plan-courses/:id` | `{status}` | updated plan or course |
| `/admin/universities`, `/admin/majors`, `/admin/courses` | full CRUD with filters and pagination; courses take `prerequisiteIds` | — |
| `GET /admin/students` | paginated | `{id, name, email, university, major, createdAt, gpa?, creditsCompleted?, stage}` |

### Essential to replace the simulations, but stateless (no new models)

| Endpoint | Contract already in the code |
|---|---|
| `POST /what-if` `{scenario}` | `ScenarioResult` from `types/what-if.ts` |
| `POST /advisor/chat` (SSE) `{messages}` | text chunks; matches `AdvisorService.streamReply` |
| `POST /resources/search` `{query, goal?, platforms}` | `SearchResult` from `simulation/sources/search.ts` |
| `GET /me/recommendations` | `{failed: FocusCourse[], difficult: FocusCourse[]}` |
| `POST /quizzes/generate` `{resourceId \| courseId, count}` | `Quiz` from `lib/sources/quiz.ts`, not stored |

### Optional

- `GET /me/academic-summary` (GPA, credits and term history can also be computed on the client)
- `GET /admin/stats` (counts, registrations by month, sources by status)
- `GET /admin/sources` + `POST /admin/sources/:id/retry`
- `/admin/learning-resources` CRUD

---

## G. Database limitations

These are genuine gaps that affect existing screens.

1. **No course requirement category.** This breaks the requirement-progress bars, the category filter and badges on Courses, the admin category field, the plan's requirement column, and the advisor's elective logic. It's needed unless those features are dropped.
2. **No total required credits on Major.** This breaks credits remaining, graduation %, the plan's "x / 128", and the admin student progress bar. Summing the major's course credits doesn't work as a substitute, because the catalog includes electives beyond what's required.
3. **No corequisites.** CoursePrerequisite only describes prerequisites, unless it has a type column **(unverified)**. Either add a type or remove corequisites from the admin form and the course card.
4. **No offered terms.** This affects the "Offered" line on course cards and the what-if scheduler's correctness. Decision needed: add a field, or let the AI infer it, which makes it less accurate.
5. **No current standing for in-progress courses.** This drives "difficult courses", the what-if baseline GPA, and advisor answers. **No schema change is needed** if AcademicRecord.grade is nullable and is documented as a provisional grade for IN_PROGRESS rows. The `detail` text ("Midterm: 84%") should be dropped.
6. **A course belongs to a single major.**
   - Shared courses such as MATH or ENGL gen-eds have to be duplicated per major.
   - A transcript course outside the student's major can't be recorded until that course exists under the major.
   - Code uniqueness should be per major, but admin currently validates per university.
   - This is workable; it's just a constraint to be aware of.
7. **No university info status and no "AI-captured" provenance** on University or Course. This can be partly derived from CourseMaterialSource. Recommendation: drop the verified vs. AI-captured distinction, since all saved data is validated anyway, rather than adding fields.
8. **No term calendar** (week X of Y). Drop that UI or put it in config.
9. **AI plan rationale, notes and assumptions** may not be storable **(unverified)**. Drop them or regenerate on demand; this isn't worth a schema change.
10. **LearningResource fields.** If it has no `title` **(unverified)**, that's a real gap, because cards can't render without one. Duration, difficulty and topics should simply become optional in the UI.
11. **Universities entered by students** can't be told apart from admin-approved ones, so duplicates are possible. Dedupe on the backend for now.

**Not limitations:** what-if, quizzes, chat and uploaded documents need no models, as intended.

---

## H. Prioritized action plan

### P0: blocking backend integration

1. **Write the Prisma models and settle gaps G1–G3 first.** The schema file is empty, and every contract depends on it. (`backend/prisma/schema.prisma`)
2. **Replace the module-level mock imports with an async data layer** (hooks and services), keeping the existing service signatures. Today the student app shows one hardcoded student. Affected files:
   - `lib/academic/record.ts`, `lib/academic/plan.ts`, `lib/sources/recommendations.ts`
   - `pages/overview/Overview.tsx`, `pages/semester-plan/SemesterPlan.tsx`, `pages/courses/Courses.tsx`, `pages/sources/Sources.tsx`
   - `webApp/sideBar/app-sidebar.tsx`, `layouts/app-topbar.tsx`
3. **Switch to ID-based course identity.** Prerequisites become `{id, code}`, and `getCourse` must stop throwing. Affected files:
   - `lib/academic/catalog.ts`, `mock/academic/*.ts`
   - `schemas/admin.ts`, `mock/admin/courses.ts`, `pages/admin/Courses.tsx`
4. **Real auth with roles.** Add `id`/`role` to `Account`, bootstrap from `/me`, refresh tokens, guard the admin console, redirect by role at sign-in, and stop storing the account in sessionStorage. Affected files:
   - `simulation/auth/mock-auth.ts`
   - `components/onboarding/onboarding-provider.tsx`, `lib/onboarding/onboarding-context.ts`
   - `layouts/app-layout.tsx`, `layouts/admin-layout.tsx`
   - `pages/auth/Login.tsx`, `pages/auth/Register.tsx`
5. **Major selection.** Remove free-text major from registration. Add a major choice after the university step. Add a major field to the admin course form. Affected files:
   - `schemas/auth.ts`, `pages/auth/Register.tsx`, `pages/onboarding/UniversityFinder.tsx`, `data/onboarding.ts`
   - `admin/courses/course-form.tsx`, `schemas/admin.ts`
6. **University selected by id.** Affected files: `simulation/onboarding/university-catalog.ts`, `UniversityFinder.tsx`, `university-summary.tsx`.

### P1: core student and admin workflows

1. **Transcript review/confirm, then bulk-save AcademicRecords.** This satisfies "validated before saving", and `Complete.tsx` already promises it. (`Transcript.tsx`, `Complete.tsx`)
2. **Real uploads plus a CourseMaterialSource status UI** (four states, error message, retry). Decide whether to accept DOCX. Affected files:
   - `hooks/use-upload-queue.ts`, `schemas/upload.ts`, `lib/files/upload-config.ts`
   - `onboarding/uploads/multi-file-uploader.tsx`, `UniversityDocuments.tsx`, `catalog-found-panel.tsx`
3. **Map the year field to `currentSemester`.** (`data/academic-years.ts`, `schemas/auth.ts`, `onboarding-provider.tsx` `transcriptRequired`)
4. **Map statuses, including FAILED and SKIPPED.** Affected files:
   - `lib/academic/record.ts`, `lib/academic/plan.ts`
   - `plan/plan-status.tsx`, `courses/course-card.tsx`, `Courses.tsx` (status filter)
5. **Empty states for new students and loading/error states everywhere.** (`gpa-trend-chart.tsx:16`, `Overview.tsx:43`, `SemesterPlan.tsx:41,83,138`)
6. **Study plan lifecycle:** generate, activate and regenerate. Derive the graduation date from the last semester. Remove the literals in `Overview.tsx:165`, `semester-plan.ts:54` and `SemesterPlan.tsx:73`.
7. **Error and pending handling on auth and admin changes.** (`Register.tsx`, `Login.tsx`, `pages/admin/Courses.tsx`, `pages/admin/Universities.tsx`)
8. **Decide the standing convention (G5).** Affects `lib/sources/recommendations.ts` and the what-if and advisor services.
9. **Align the LearningResource shape:** platform vs. provider, `resourceType`, single course id, remove `quizTopic`. Affected files:
   - `mock/sources/resources.ts`, `simulation/sources/search.ts`, `schemas/sources.ts`
   - `sources/platform.tsx`, `sources/resource-card.tsx`, `sources/resource-dialog.tsx`, `lib/sources/quiz.ts`
10. **Admin Major management.** Majors have to exist before students can pick one.

### P2: important but not blocking

1. Drop or derive the admin university fields shortName, catalogYear and status, plus the info-coverage bar and `capturedByAi`. (`university-form.tsx`, `schemas/admin.ts`, `Dashboard.tsx`, `pages/admin/Courses.tsx`)
2. Admin CourseMaterialSource management page.
3. Admin student fields: derive the stage from the profile, records and plan; drop `documents.transcripts` and "in-review"; derive lastActive from Session. (`student-details.tsx`, `Students.tsx`)
4. Remove the fixed dates. (`lib/admin/format.ts:2`, `lib/admin/selectors.ts:26`, `Dashboard.tsx:68`)
5. Make the GPA chart's Y range dynamic and stop hardcoding the Dean's List line. (`gpa-trend-plot.tsx:52,15`)
6. Drop the week-of-term tile, or find a source for it. (`Overview.tsx:123-136`)
7. Change optional types to `| null`.
8. Add a course-details route. Move admin tables to server-side search and pagination as data grows. (`admin/data-table.tsx`)

### P3: optional

1. Offered-terms field (if chosen in G4).
2. Leave the landing preview static.
3. Fix mock inconsistencies: "Year 3" vs. "Year 4", and graduation "May 2028" vs. "December 2027".
4. Move the dev script `src/__whatif-check.ts` out of `src`.

---

## I. Final verdict

1. **Can it connect without major changes?** No. The components and the service contracts can be reused. But the student app is wired to one hardcoded student, courses have no IDs, majors don't appear anywhere, and auth has no roles. Those changes are mostly in the data layer, not the UI design.

2. **What's already compatible?**
   - The sign-in fields, and the email and password fields at registration.
   - The finder's name, country and city values.
   - Upload validation (PDF and images are a subset of SourceType).
   - What-if, the advisor, quizzes and resource search, as temporary features with ready contracts.
   - The calculation logic: `lib/gpa.ts`, the plan-timeline merge, and prerequisite gaps.
   - The admin university core fields and the admin course core fields.

3. **What can't be populated correctly today?**
   - Requirement progress, credits required/remaining, graduation %, and the plan's "/ 128".
   - Category badges and filters, corequisites, and "Offered" terms.
   - Week of term, and the "difficult courses" recommendations.
   - FAILED course status.
   - University info status, shortName, catalogYear and the AI-captured counts.
   - Student "in review" status and transcript counts.
   - The expected graduation date, which is hardcoded.
   - Registration's major and year fields.
   - LearningResource format, duration, difficulty and topics.

4. **Are Prisma schema changes truly necessary?**
   - First, the models need to be written at all.
   - Beyond that, **two** additions are needed: a course requirement category, and the major's total required credits.
   - **One** depends on a decision: a prerequisite/corequisite type, but only if corequisites stay.
   - Two need checking: whether LearningResource has `title`, and whether to store offered terms.
   - Nothing else needs a schema change. University status can be derived or dropped. Standing can reuse `grade` on IN_PROGRESS rows. What-if, quizzes, documents and chat need no models.

5. **What to fix first?**
   - Write the schema with the decisions above.
   - Add auth with roles and a `/me` bootstrap.
   - Make course identity ID-based and add major selection.
   - Replace the module-level mock imports with an async data layer that has loading, empty and error states.
