import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/api/query-keys"

/**
 * Public reference data that powers the onboarding autocomplete: countries and cities from
 * countries.dev, universities from Hipo's university-domains-list API. Both are free, keyless,
 * CORS-enabled services, so they're called directly with `fetch` rather than through the
 * authenticated backend client.
 */

const COUNTRIES_API_URL = import.meta.env.VITE_COUNTRIES_API_URL || "https://countries.dev"
/** Hipo's hosted API only serves plain HTTP — proxy it when the app is served over HTTPS. */
const UNIVERSITIES_API_URL = import.meta.env.VITE_UNIVERSITIES_API_URL || "http://universities.hipolabs.com"

// ── Types ────────────────────────────────────────────────────────────────────

export type Country = {
  name: string
  /** ISO 3166-1 alpha-2, e.g. "JO". */
  code: string
  flag: string
}

export type City = {
  id: number
  name: string
  countryCode: string
  population: number
}

export type University = {
  name: string
  country: string
  countryCode: string
  stateProvince: string | null
  domain: string | null
  website: string | null
}

type CountryResponse = { name: string; alpha2Code: string; flag: string }

type CityResponse = {
  geonameId: number
  name: string
  countryCode: string
  population: number
}

type UniversityResponse = {
  name: string
  country: string
  alpha_two_code: string
  "state-province": string | null
  domains: string[]
  web_pages: string[]
}

// ── Fetchers ─────────────────────────────────────────────────────────────────

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } })
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
  return (await response.json()) as T
}

export async function fetchCountries(signal?: AbortSignal): Promise<Country[]> {
  const rows = await getJson<CountryResponse[]>(
    `${COUNTRIES_API_URL}/countries?fields=name,alpha2Code,flag&limit=300`,
    signal,
  )
  return rows
    .map((row) => ({ name: row.name, code: row.alpha2Code, flag: row.flag }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchCities(countryCode: string, query: string, signal?: AbortSignal): Promise<City[]> {
  const params = new URLSearchParams({ country: countryCode, limit: "8" })
  if (query) params.set("q", query)
  const rows = await getJson<CityResponse[]>(`${COUNTRIES_API_URL}/cities?${params}`, signal)
  return rows.map((row) => ({
    id: row.geonameId,
    name: row.name,
    countryCode: row.countryCode,
    population: row.population,
  }))
}

/**
 * Hipo spells some countries differently from countries.dev (and its `country` filter is an
 * exact match), so these codes are looked up by Hipo's own spelling.
 */
const HIPO_COUNTRY_NAMES: Record<string, string> = {
  BO: "Bolivia, Plurinational State of",
  CD: "Congo, the Democratic Republic of the",
  CI: "Côte d'Ivoire",
  CV: "Cape Verde",
  GB: "United Kingdom",
  IR: "Iran",
  KP: "Korea, Democratic People's Republic of",
  KR: "Korea, Republic of",
  MD: "Moldova, Republic of",
  TR: "Turkiye",
  TW: "Taiwan, Province of China",
  US: "United States",
  VA: "Holy See (Vatican City State)",
  VE: "Venezuela, Bolivarian Republic of",
  VG: "Virgin Islands, British",
  XK: "Kosovo",
}

export const hipoCountryName = (country: Country) => HIPO_COUNTRY_NAMES[country.code] ?? country.name

const toUniversity = (row: UniversityResponse): University => ({
  name: row.name.trim(),
  country: row.country,
  countryCode: row.alpha_two_code,
  stateProvince: row["state-province"],
  domain: row.domains[0] ?? null,
  website: row.web_pages[0] ?? null,
})

/** Every university Hipo lists in one country — small enough to fetch once and filter locally. */
export async function fetchUniversitiesInCountry(country: Country, signal?: AbortSignal): Promise<University[]> {
  const params = new URLSearchParams({ country: hipoCountryName(country) })
  const rows = await getJson<UniversityResponse[]>(`${UNIVERSITIES_API_URL}/search?${params}`, signal)
  return rows.map(toUniversity)
}

/** Worldwide name search, for when the student hasn't picked a country yet. */
export async function searchUniversities(query: string, signal?: AbortSignal): Promise<University[]> {
  const params = new URLSearchParams({ name: query, limit: "8" })
  const rows = await getJson<UniversityResponse[]>(`${UNIVERSITIES_API_URL}/search?${params}`, signal)
  return rows.map(toUniversity)
}

// ── Matching ─────────────────────────────────────────────────────────────────

/** Lowercase and strip accents, so "cote" finds "Côte d'Ivoire". */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()

/** Items whose label contains the query, those starting with it first. */
export function rankMatches<T>(items: T[], query: string, label: (item: T) => string, limit = 8): T[] {
  const needle = normalize(query)
  if (!needle) return items.slice(0, limit)
  const starts: T[] = []
  const contains: T[] = []
  for (const item of items) {
    const haystack = normalize(label(item))
    if (haystack.startsWith(needle)) starts.push(item)
    else if (haystack.includes(needle)) contains.push(item)
  }
  return [...starts, ...contains].slice(0, limit)
}

/** The country whose name matches the text exactly (ignoring case and accents), if any. */
export function findCountry(countries: Country[] | undefined, text: string): Country | undefined {
  const needle = normalize(text)
  if (!needle || !countries) return undefined
  return countries.find((country) => normalize(country.name) === needle || hipoCountryName(country) === text.trim())
}

// ── Hooks ────────────────────────────────────────────────────────────────────

const DAY = 24 * 60 * 60_000

export function useCountries() {
  return useQuery({
    queryKey: queryKeys.directory.countries,
    queryFn: ({ signal }) => fetchCountries(signal),
    staleTime: Infinity,
    gcTime: DAY,
  })
}

export function useCities(countryCode: string | undefined, query: string) {
  return useQuery({
    queryKey: queryKeys.directory.cities(countryCode, normalize(query)),
    queryFn: ({ signal }) => fetchCities(countryCode as string, query.trim(), signal),
    enabled: Boolean(countryCode),
    staleTime: DAY,
    placeholderData: keepPreviousData,
  })
}

/**
 * University suggestions: filtered locally from the selected country's list, or searched
 * worldwide by name (3+ characters) when no country is selected.
 */
export function useUniversitySuggestions(country: Country | undefined, query: string) {
  const inCountry = useQuery({
    queryKey: queryKeys.directory.universitiesIn(country?.code),
    queryFn: ({ signal }) => fetchUniversitiesInCountry(country as Country, signal),
    enabled: Boolean(country),
    staleTime: DAY,
  })

  const needle = query.trim()
  const worldwide = useQuery({
    queryKey: queryKeys.directory.universitySearch(normalize(needle)),
    queryFn: ({ signal }) => searchUniversities(needle, signal),
    enabled: !country && needle.length >= 3,
    staleTime: DAY,
    placeholderData: keepPreviousData,
  })

  if (country) {
    return {
      universities: inCountry.data ? rankMatches(inCountry.data, needle, (u) => u.name) : [],
      isLoading: inCountry.isLoading,
      isError: inCountry.isError,
    }
  }
  return {
    universities: needle.length >= 3 ? (worldwide.data ?? []) : [],
    isLoading: worldwide.isFetching,
    isError: worldwide.isError,
  }
}
