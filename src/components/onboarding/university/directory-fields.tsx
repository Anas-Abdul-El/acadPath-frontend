import { useMemo, type Ref } from "react"
import { Globe, MapPin } from "lucide-react"

import {
  rankMatches,
  useCities,
  useCountries,
  useUniversitySuggestions,
  type Country,
  type University,
} from "@/api/directory"
import { ComboboxInput, type ComboboxOption } from "@/components/shared/combobox-input"
import type { ControlProps } from "@/components/shared/form-field"
import { COMMON_MAJORS } from "@/data/majors"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

/** What each field needs from react-hook-form's Controller plus FormField's ARIA wiring. */
type FieldBinding = ControlProps & {
  name: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  inputRef: Ref<HTMLInputElement>
}

const bind = ({ inputRef, ...binding }: FieldBinding) => ({
  ...binding,
  ref: inputRef,
  className: "h-10",
})

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

// ── Country ──────────────────────────────────────────────────────────────────

export function CountryField({ onSelectCountry, ...binding }: FieldBinding & { onSelectCountry: (country: Country) => void }) {
  const countries = useCountries()

  const matches = useMemo(
    () => rankMatches(countries.data ?? [], binding.value, (country) => country.name),
    [countries.data, binding.value],
  )

  const options: ComboboxOption[] = matches.map((country) => ({
    id: country.code,
    label: country.name,
    leading: country.flag,
  }))

  return (
    <ComboboxInput
      {...bind(binding)}
      listLabel="Countries"
      autoComplete="off"
      placeholder="e.g. Jordan"
      options={options}
      loading={countries.isLoading}
      message={
        countries.isError
          ? "Couldn't load the country list — type your country instead."
          : binding.value.trim()
            ? "No matching country."
            : undefined
      }
      onSelectOption={(option) => {
        const country = matches.find((match) => match.code === option.id)
        if (country) onSelectCountry(country)
      }}
    />
  )
}

// ── University ───────────────────────────────────────────────────────────────

export function UniversityNameField({
  country,
  onSelectUniversity,
  ...binding
}: FieldBinding & { country: Country | undefined; onSelectUniversity: (university: University) => void }) {
  const query = useDebouncedValue(binding.value, 300)
  const { universities, isLoading, isError } = useUniversitySuggestions(country, query)

  const options: ComboboxOption[] = universities.map((university) => ({
    id: `${university.countryCode}:${university.name}`,
    label: university.name,
    description: [university.domain, country ? null : university.country].filter(Boolean).join(" · ") || undefined,
    leading: <Globe className="size-4 text-muted-foreground" />,
  }))

  const trimmed = binding.value.trim()
  const message = isError
    ? "University lookup is unavailable right now — type the full name."
    : !country && trimmed.length < 3
      ? "Type at least 3 letters, or pick your country first to browse its universities."
      : trimmed
        ? "Not in our directory — that's fine, keep the name you typed."
        : undefined

  return (
    <ComboboxInput
      {...bind(binding)}
      listLabel="Universities"
      autoComplete="organization"
      placeholder="e.g. University of Jordan"
      options={options}
      loading={isLoading}
      message={message}
      onSelectOption={(option) => {
        const university = universities.find((u) => `${u.countryCode}:${u.name}` === option.id)
        if (university) onSelectUniversity(university)
      }}
    />
  )
}

// ── City ─────────────────────────────────────────────────────────────────────

export function CityField({ country, ...binding }: FieldBinding & { country: Country | undefined }) {
  const query = useDebouncedValue(binding.value, 250)
  const cities = useCities(country?.code, query)

  const options: ComboboxOption[] = (cities.data ?? []).map((city) => ({
    id: String(city.id),
    label: city.name,
    description: city.population > 0 ? `${compactNumber.format(city.population)} residents` : undefined,
    leading: <MapPin className="size-4 text-muted-foreground" />,
  }))

  return (
    <ComboboxInput
      {...bind(binding)}
      listLabel="Cities"
      autoComplete="address-level2"
      placeholder="e.g. Amman"
      options={options}
      loading={cities.isFetching && !cities.data?.length}
      message={
        !country
          ? "Pick a country to see its cities."
          : cities.isError
            ? "Couldn't load cities — type your city instead."
            : binding.value.trim()
              ? "No matching city — keep what you typed."
              : undefined
      }
      onSelectOption={(option) => binding.onValueChange(option.label)}
    />
  )
}

// ── Major ────────────────────────────────────────────────────────────────────

export function MajorField(binding: FieldBinding) {
  const options: ComboboxOption[] = rankMatches(COMMON_MAJORS, binding.value, (major) => major).map((major) => ({
    id: major,
    label: major,
  }))

  return (
    <ComboboxInput
      {...bind(binding)}
      listLabel="Majors"
      autoComplete="off"
      placeholder="e.g. Computer Science"
      options={options}
      onSelectOption={(option) => binding.onValueChange(option.label)}
    />
  )
}
