/**
 * SIMULATED resource search. Ranks the sample resources by how well they match a course code,
 * course name, or topic. Replace `searchResources` with a call to an AI or resource-search API —
 * the page only depends on its signature and `SearchResult`.
 */
import { courseCatalog, type CatalogCourse } from "@/mock/academic/course-catalog"
import { resources, type LearningResource, type Platform } from "@/mock/sources/resources"

export type SearchRequest = {
  query: string
  /** Optional free text about what the student wants to learn. */
  goal?: string
  platforms: Platform[]
}

export type SearchResult = {
  results: LearningResource[]
  /** Catalog course the query was recognized as, if any. */
  matchedCourse?: CatalogCourse
}

const SIMULATED_LATENCY_MS = 900
const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")
/** Too generic to rank on ("Operating Systems" shouldn't match "Database Systems"). */
const STOP_WORDS = new Set([
  "the", "and", "for", "how", "what", "want", "learn", "with", "about",
  "systems", "system", "introduction", "intro", "computer", "fundamentals", "principles", "course",
])
const words = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

function matchCourse(query: string): CatalogCourse | undefined {
  const q = compact(query)
  if (!q) return undefined
  return (
    courseCatalog.find((course) => compact(course.code) === q) ??
    courseCatalog.find((course) => course.title.toLowerCase() === query.trim().toLowerCase()) ??
    courseCatalog.find((course) => q.length >= 6 && compact(course.title).includes(q))
  )
}

function score(resource: LearningResource, terms: string[], course?: CatalogCourse) {
  let total = course && resource.courseCodes.includes(course.code) ? 10 : 0
  const haystack = `${resource.title} ${resource.description} ${resource.topics.join(" ")}`.toLowerCase()
  for (const term of terms) {
    if (resource.topics.some((topic) => topic.includes(term))) total += 3
    else if (haystack.includes(term)) total += 1
  }
  return total
}

export function searchResourcesSync({ query, goal = "", platforms }: SearchRequest): SearchResult {
  const matchedCourse = matchCourse(query)
  const terms = [...new Set([...words(query), ...words(goal), ...(matchedCourse ? words(matchedCourse.title) : [])])]
  const results = resources
    .filter((resource) => platforms.includes(resource.platform))
    .map((resource) => ({ resource, score: score(resource, terms, matchedCourse) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.resource.verified) - Number(a.resource.verified))
    .map((entry) => entry.resource)
  return { results, matchedCourse }
}

export async function searchResources(request: SearchRequest, signal?: AbortSignal): Promise<SearchResult> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, SIMULATED_LATENCY_MS)
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer)
      reject(signal.reason)
    })
  })
  return searchResourcesSync(request)
}
