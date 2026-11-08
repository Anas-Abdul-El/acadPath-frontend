import type { MeDto, OnboardingDto } from "@/api/types"
import { ROUTES } from "@/lib/routes"

type OnboardingPath = (typeof ROUTES.onboarding)[keyof typeof ROUTES.onboarding]

const STEP_ORDER: OnboardingPath[] = [
  ROUTES.onboarding.university,
  ROUTES.onboarding.universityDocuments,
  ROUTES.onboarding.transcript,
  ROUTES.onboarding.complete,
]

/** Whether the student still has to upload university documents (no usable catalog yet). */
export const needsUniversityDocuments = (onboarding: OnboardingDto) => onboarding.catalogStatus !== "AVAILABLE"

/** Whether the year-and-transcript step is still unfinished. */
export const needsTranscriptStep = (onboarding: OnboardingDto) =>
  !onboarding.yearOfStudySelected || (onboarding.transcriptRequired && !onboarding.transcriptUploaded)

/** The first onboarding step the student hasn't finished, decided by the server's flags. */
export function nextOnboardingStep(onboarding: OnboardingDto): OnboardingPath {
  if (!onboarding.universitySelected) return ROUTES.onboarding.university
  if (needsUniversityDocuments(onboarding)) return ROUTES.onboarding.universityDocuments
  if (needsTranscriptStep(onboarding)) return ROUTES.onboarding.transcript
  return ROUTES.onboarding.complete
}

/**
 * Steps up to and including the next unfinished one are open; later ones aren't. Earlier steps
 * stay open so the student can go back and change an answer.
 */
export function canVisitStep(path: string, onboarding: OnboardingDto): boolean {
  const index = STEP_ORDER.indexOf(path as OnboardingPath)
  if (index === -1) return false
  return index <= STEP_ORDER.indexOf(nextOnboardingStep(onboarding))
}

/** Where a signed-in user belongs: the admin console, the student app, or their next setup step. */
export function homeFor(me: MeDto): string {
  if (me.user.role === "ADMIN") return ROUTES.admin.dashboard
  if (!me.onboarding || me.onboarding.completed) return ROUTES.app.overview
  return nextOnboardingStep(me.onboarding)
}

/** Honors a `?next=` path only when it belongs to the area this user lands in. */
export function redirectTarget(me: MeDto, next: string | null): string {
  const home = homeFor(me)
  if (!next || !next.startsWith("/") || next.startsWith("//")) return home
  const area = home.split("/")[1]
  return next.split("/")[1] === area ? next : home
}
