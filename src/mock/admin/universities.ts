/**
 * Sample university records for the admin console. Directory entries are reused from the
 * University Finder's mock directory. Replace with the admin API response later.
 */
import { catalogInfo } from "@/mock/academic/course-catalog"
import { universities as directory } from "@/mock/universities"

export type AdminUniversity = {
  id: string
  name: string
  shortName?: string
  country: string
  city: string
  website?: string
  catalogYear?: string
  addedAt: string
}

export const sampleUniversities: AdminUniversity[] = [
  {
    id: "northfield",
    name: catalogInfo.university,
    shortName: "NU",
    country: "United States",
    city: "Northfield",
    website: "https://catalog.northfield.edu",
    catalogYear: "2023–24",
    addedAt: "2026-01-12",
  },
  ...directory.map((university, index): AdminUniversity => ({
    id: university.id,
    name: university.name,
    shortName: university.shortName,
    country: university.country,
    city: university.city,
    website: university.catalog ? `https://${university.catalog.source}` : undefined,
    catalogYear: university.catalog ? "2025–26" : undefined,
    addedAt: `2026-0${(index % 8) + 1}-${String(3 + ((index * 7) % 25)).padStart(2, "0")}`,
  })),
]
