/**
 * Sample course records managed in the admin console. Northfield's courses reuse the student
 * app's catalog; the others were captured by AI from documents students uploaded. Replace with API data later.
 */
import { courseCatalog, type CourseCategory } from "@/mock/academic/course-catalog"

export type AdminCourse = {
  id: string
  universityId: string
  code: string
  title: string
  description: string
  credits: number
  category: CourseCategory
  prerequisites: string[]
  corequisites: string[]
  updatedAt: string
  updatedBy: string
  /** True when the AI captured this course from documents students uploaded. */
  capturedByAi?: boolean
}

/** Recorded as the editor of courses the AI captured from student documents. */
export const AI_EXTRACTOR = "AcadPath AI"

type Seed = Omit<AdminCourse, "id" | "universityId" | "updatedAt" | "updatedBy">

const course = (universityId: string, updatedAt: string, updatedBy: string, seed: Seed): AdminCourse => ({
  id: `${universityId}-${seed.code.replace(/\s+/g, "-").toLowerCase()}`,
  universityId,
  updatedAt,
  updatedBy,
  ...seed,
})

const northfield = courseCatalog.map((c, index) =>
  course("northfield", `2026-0${(index % 6) + 1}-${String(10 + (index % 18)).padStart(2, "0")}`, "Catalog import", {
    code: c.code,
    title: c.title,
    description: c.description,
    credits: c.credits,
    category: c.category,
    prerequisites: c.prerequisites,
    corequisites: c.corequisites,
  }),
)

const jordan: AdminCourse[] = [
  { code: "CS 1301", title: "Computer Skills for Engineers", description: "Programming fundamentals in C++ with problem solving for engineering students.", credits: 3, category: "major-requirement", prerequisites: [], corequisites: [] },
  { code: "CS 1321", title: "Object-Oriented Programming", description: "Classes, inheritance, polymorphism, and templates in C++.", credits: 3, category: "major-requirement", prerequisites: ["CS 1301"], corequisites: [] },
  { code: "CS 2311", title: "Data Structures", description: "Linked lists, stacks, queues, trees, and hashing with complexity analysis.", credits: 3, category: "major-requirement", prerequisites: ["CS 1321"], corequisites: [] },
  { code: "CS 3341", title: "Database Management Systems", description: "ER modeling, relational algebra, SQL, and normalization.", credits: 3, category: "major-requirement", prerequisites: ["CS 2311"], corequisites: [] },
  { code: "CS 4351", title: "Artificial Intelligence", description: "Search, knowledge representation, reasoning, and introductory machine learning.", credits: 3, category: "major-elective", prerequisites: ["CS 2311"], corequisites: [] },
  { code: "MATH 101", title: "Calculus I", description: "Limits, continuity, derivatives, and applications of differentiation.", credits: 3, category: "math-science", prerequisites: [], corequisites: [] },
  { code: "ARB 099", title: "Arabic Language Skills", description: "University-level Arabic reading, writing, and grammar.", credits: 3, category: "general-education", prerequisites: [], corequisites: [] },
  { code: "MS 100", title: "Military Science", description: "National education and civic responsibility (university requirement).", credits: 3, category: "general-education", prerequisites: [], corequisites: [] },
].map((seed, index) => ({
  ...course("ju", `2026-10-${String(4 + index).padStart(2, "0")}`, AI_EXTRACTOR, seed as Seed),
  capturedByAi: true,
}))

const beirut: AdminCourse[] = [
  { code: "CMPS 200", title: "Introduction to Programming", description: "Programming in Python with emphasis on algorithmic thinking.", credits: 3, category: "major-requirement", prerequisites: [], corequisites: [] },
  { code: "CMPS 211", title: "Discrete Structures", description: "Logic, sets, relations, functions, counting, and graphs.", credits: 3, category: "major-requirement", prerequisites: [], corequisites: ["CMPS 200"] },
  { code: "CMPS 212", title: "Intermediate Programming", description: "Object-oriented programming and basic data structures in Java.", credits: 3, category: "major-requirement", prerequisites: ["CMPS 200"], corequisites: [] },
  { code: "CMPS 256", title: "Advanced Programming and Data Structures", description: "Trees, graphs, hashing, and algorithm design techniques.", credits: 3, category: "major-requirement", prerequisites: ["CMPS 212", "CMPS 211"], corequisites: [] },
  { code: "CMPS 287", title: "Artificial Intelligence", description: "Agents, search, constraint satisfaction, and probabilistic reasoning.", credits: 3, category: "major-elective", prerequisites: ["CMPS 256"], corequisites: [] },
  { code: "ENGL 203", title: "Academic English", description: "Reading and writing academic arguments across disciplines.", credits: 3, category: "general-education", prerequisites: [], corequisites: [] },
].map((seed, index) => course("aub", `2026-09-${String(12 + index * 2).padStart(2, "0")}`, "Catalog import", seed as Seed))

const kfupm: AdminCourse[] = [
  { code: "ICS 104", title: "Introduction to Programming in Python", description: "Problem solving, control structures, functions, and files in Python.", credits: 3, category: "major-requirement", prerequisites: [], corequisites: [] },
  { code: "ICS 108", title: "Object-Oriented Programming", description: "Object-oriented design and programming with Java.", credits: 4, category: "major-requirement", prerequisites: ["ICS 104"], corequisites: [] },
  { code: "ICS 202", title: "Data Structures and Algorithms", description: "Data structures and algorithm analysis with Java implementations.", credits: 4, category: "major-requirement", prerequisites: ["ICS 108"], corequisites: [] },
  { code: "ICS 485", title: "Machine Learning", description: "Supervised and unsupervised learning with practical projects.", credits: 3, category: "major-elective", prerequisites: ["ICS 202"], corequisites: [] },
  { code: "MATH 101", title: "Calculus I", description: "Functions, limits, derivatives, and their applications.", credits: 4, category: "math-science", prerequisites: [], corequisites: [] },
].map((seed, index) => course("kfupm", `2026-08-${String(20 + index).padStart(2, "0")}`, "Catalog import", seed as Seed))

const cairo: AdminCourse[] = [
  { code: "CS 111", title: "Fundamentals of Programming", description: "Structured programming in C with problem-solving techniques.", credits: 3, category: "major-requirement", prerequisites: [], corequisites: [] },
  { code: "CS 214", title: "Data Structures", description: "Abstract data types, linked structures, trees, and sorting.", credits: 3, category: "major-requirement", prerequisites: ["CS 111"], corequisites: [] },
  { code: "IS 211", title: "Introduction to Databases", description: "Database concepts, relational model, and SQL.", credits: 3, category: "major-requirement", prerequisites: ["CS 111"], corequisites: [] },
  { code: "HU 111", title: "Technical Report Writing", description: "Structure and style of technical reports in English.", credits: 2, category: "general-education", prerequisites: [], corequisites: [] },
].map((seed, index) => ({
  ...course("cu", `2026-10-${String(10 + index).padStart(2, "0")}`, AI_EXTRACTOR, seed as Seed),
  capturedByAi: true,
}))

export const sampleCourses: AdminCourse[] = [...northfield, ...jordan, ...beirut, ...kfupm, ...cairo]
