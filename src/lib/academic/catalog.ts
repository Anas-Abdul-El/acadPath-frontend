import { courseCatalog, type CatalogCourse, type CourseCategory } from "@/mock/academic/course-catalog"

const byCode = new Map(courseCatalog.map((course) => [course.code, course]))

export function findCourse(code: string): CatalogCourse | undefined {
  return byCode.get(code)
}

/** Catalog lookup for codes the sample data guarantees exist. */
export function getCourse(code: string): CatalogCourse {
  const course = byCode.get(code)
  if (!course) throw new Error(`Unknown course code: ${code}`)
  return course
}

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()
/** "cs3110", "CS 3110" and "cs-3110" all compare equal. */
const compactCode = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")

export type CatalogFilters = {
  query: string
  category: CourseCategory | "all"
}

/** Matches the query against course code and title; filters by category. */
export function filterCatalog(courses: CatalogCourse[], { query, category }: CatalogFilters): CatalogCourse[] {
  const q = normalize(query)
  const qCode = compactCode(query)
  return courses.filter((course) => {
    if (category !== "all" && course.category !== category) return false
    if (!q) return true
    return (
      (qCode.length > 0 && compactCode(course.code).includes(qCode)) ||
      normalize(course.title).includes(q)
    )
  })
}
