import { afterEach, describe, expect, it, vi } from "vitest"

import {
  fetchUniversitiesInCountry,
  findCountry,
  hipoCountryName,
  rankMatches,
  type Country,
} from "@/api/directory"

const countries: Country[] = [
  { name: "Côte d'Ivoire", code: "CI", flag: "" },
  { name: "Jordan", code: "JO", flag: "" },
  { name: "Turkey", code: "TR", flag: "" },
  { name: "United States of America", code: "US", flag: "" },
]

describe("rankMatches", () => {
  it("puts prefix matches before substring matches", () => {
    const items = ["Computer Engineering", "Software Engineering", "Engineering Management"]
    expect(rankMatches(items, "eng", (x) => x)).toEqual([
      "Engineering Management",
      "Computer Engineering",
      "Software Engineering",
    ])
  })

  it("ignores case and accents, and caps the result", () => {
    expect(rankMatches(countries, "cote", (c) => c.name).map((c) => c.code)).toEqual(["CI"])
    expect(rankMatches(countries, "", (c) => c.name, 2)).toHaveLength(2)
  })
})

describe("findCountry", () => {
  it("matches the exact name regardless of case", () => {
    expect(findCountry(countries, " jordan ")?.code).toBe("JO")
    expect(findCountry(countries, "Jord")).toBeUndefined()
  })

  it("accepts Hipo's spelling of a country", () => {
    expect(findCountry(countries, "United States")?.code).toBe("US")
  })
})

describe("hipoCountryName", () => {
  it("translates names Hipo spells differently", () => {
    expect(hipoCountryName(countries[2])).toBe("Turkiye")
    expect(hipoCountryName(countries[1])).toBe("Jordan")
  })
})

describe("fetchUniversitiesInCountry", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("queries by Hipo's country name and maps the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            name: "Middle East Technical University ",
            country: "Turkiye",
            alpha_two_code: "TR",
            "state-province": null,
            domains: ["metu.edu.tr"],
            web_pages: ["http://www.metu.edu.tr/"],
          },
        ]),
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await fetchUniversitiesInCountry(countries[2])

    expect(String(fetchMock.mock.calls[0][0])).toContain("/search?country=Turkiye")
    expect(result).toEqual([
      {
        name: "Middle East Technical University",
        country: "Turkiye",
        countryCode: "TR",
        stateProvince: null,
        domain: "metu.edu.tr",
        website: "http://www.metu.edu.tr/",
      },
    ])
  })
})
