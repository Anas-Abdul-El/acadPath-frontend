import { describe, expect, it } from "vitest"

import {
  compareTerms,
  enumToParam,
  formatGpa,
  gradeLabel,
  graduationLabel,
  offeredLabel,
  paramToEnum,
  termId,
  termLabel,
  termShort,
} from "@/lib/labels"

describe("term labels", () => {
  it("formats a term reference", () => {
    const fall = { term: "FALL", year: 2026 } as const
    expect(termLabel(fall)).toBe("Fall 2026")
    expect(termShort(fall)).toBe("F26")
    expect(termId(fall)).toBe("fall-2026")
    expect(graduationLabel(fall)).toBe("December 2026")
    expect(graduationLabel({ term: "SPRING", year: 2027 }, true)).toBe("May 2027")
  })

  it("orders terms within a year as Spring, Summer, Fall", () => {
    expect(compareTerms({ term: "SPRING", year: 2027 }, { term: "FALL", year: 2026 })).toBeGreaterThan(0)
    expect(compareTerms({ term: "SUMMER", year: 2026 }, { term: "FALL", year: 2026 })).toBeLessThan(0)
    expect(offeredLabel(["FALL", "SPRING"])).toBe("Spring, Fall")
    expect(offeredLabel([])).toBe("Not scheduled")
  })
})

describe("grades", () => {
  it("shows letter grades and GPAs", () => {
    expect(gradeLabel("A_MINUS")).toBe("A-")
    expect(gradeLabel("B_PLUS")).toBe("B+")
    expect(formatGpa(3.6)).toBe("3.60")
    expect(formatGpa(0)).toBe("0.00")
    expect(formatGpa(null)).toBe("—")
  })
})

describe("URL params", () => {
  it("round-trips enum values through readable params", () => {
    expect(enumToParam("MAJOR_REQUIREMENT")).toBe("major-requirement")
    expect(paramToEnum("major-requirement", ["MAJOR_REQUIREMENT", "MAJOR_ELECTIVE"] as const)).toBe("MAJOR_REQUIREMENT")
    expect(paramToEnum("bogus", ["MAJOR_REQUIREMENT"] as const)).toBeNull()
    expect(paramToEnum(null, ["MAJOR_REQUIREMENT"] as const)).toBeNull()
  })
})
