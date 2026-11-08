import { describe, expect, it } from "vitest"

import type { MeDto, OnboardingDto } from "@/api/types"
import { canVisitStep, homeFor, nextOnboardingStep, redirectTarget } from "@/lib/onboarding"
import { ROUTES } from "@/lib/routes"

const base: OnboardingDto = {
  universitySelected: false,
  catalogStatus: null,
  universityDocumentsUploaded: false,
  yearOfStudySelected: false,
  transcriptRequired: true,
  transcriptUploaded: false,
  completed: false,
}

const student = (onboarding: Partial<OnboardingDto>): MeDto => ({
  user: { id: "u", name: "Maya Chen", email: "maya@example.edu", role: "STUDENT" },
  profile: null,
  onboarding: { ...base, ...onboarding },
})

describe("nextOnboardingStep", () => {
  it("walks the steps in order", () => {
    expect(nextOnboardingStep(base)).toBe(ROUTES.onboarding.university)
    expect(nextOnboardingStep({ ...base, universitySelected: true, catalogStatus: "UNAVAILABLE" })).toBe(
      ROUTES.onboarding.universityDocuments,
    )
    const withCatalog = { ...base, universitySelected: true, catalogStatus: "AVAILABLE" as const }
    expect(nextOnboardingStep(withCatalog)).toBe(ROUTES.onboarding.transcript)
    expect(nextOnboardingStep({ ...withCatalog, yearOfStudySelected: true })).toBe(ROUTES.onboarding.transcript)
    expect(nextOnboardingStep({ ...withCatalog, yearOfStudySelected: true, transcriptUploaded: true })).toBe(
      ROUTES.onboarding.complete,
    )
  })

  it("skips the transcript upload for new students", () => {
    expect(
      nextOnboardingStep({
        ...base,
        universitySelected: true,
        catalogStatus: "AVAILABLE",
        yearOfStudySelected: true,
        transcriptRequired: false,
      }),
    ).toBe(ROUTES.onboarding.complete)
  })
})

describe("canVisitStep", () => {
  const atTranscript = { ...base, universitySelected: true, catalogStatus: "AVAILABLE" as const }

  it("opens earlier steps and the next one, but not later ones", () => {
    expect(canVisitStep(ROUTES.onboarding.university, atTranscript)).toBe(true)
    expect(canVisitStep(ROUTES.onboarding.universityDocuments, atTranscript)).toBe(true)
    expect(canVisitStep(ROUTES.onboarding.transcript, atTranscript)).toBe(true)
    expect(canVisitStep(ROUTES.onboarding.complete, atTranscript)).toBe(false)
    expect(canVisitStep("/onboarding", atTranscript)).toBe(false)
  })
})

describe("homeFor / redirectTarget", () => {
  it("sends each user to their area", () => {
    expect(homeFor(student({}))).toBe(ROUTES.onboarding.university)
    expect(homeFor(student({ completed: true }))).toBe(ROUTES.app.overview)
    expect(homeFor({ user: { id: "a", name: "Admin", email: "a@x.io", role: "ADMIN" }, profile: null, onboarding: null })).toBe(
      ROUTES.admin.dashboard,
    )
  })

  it("only honors ?next inside the user's own area", () => {
    const done = student({ completed: true })
    expect(redirectTarget(done, "/app/plan")).toBe("/app/plan")
    expect(redirectTarget(done, "/admin")).toBe(ROUTES.app.overview)
    expect(redirectTarget(done, "//evil.example")).toBe(ROUTES.app.overview)
    expect(redirectTarget(done, null)).toBe(ROUTES.app.overview)
  })
})
