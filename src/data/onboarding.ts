export type OnboardingStepId = "account" | "university" | "university-docs" | "transcript"

export type OnboardingStep = {
  id: OnboardingStepId
  label: string
  /** Shorter label for the compact step indicator. */
  shortLabel: string
  summary: string
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "account",
    label: "Create your account",
    shortLabel: "Account",
    summary: "Your name and email — that's all we need to start.",
  },
  {
    id: "university",
    label: "Find your university",
    shortLabel: "University",
    summary: "We check whether your university publishes its course catalog.",
  },
  {
    id: "university-docs",
    label: "Upload university documents",
    shortLabel: "Documents",
    summary: "Only if it isn't public: course lists, credits, prerequisites, and requirements.",
  },
  {
    id: "transcript",
    label: "Year & transcript",
    shortLabel: "Transcript",
    summary: "Your year of study, plus your transcript if you've already taken courses.",
  },
]
