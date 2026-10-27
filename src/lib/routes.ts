/** Every app path in one place, so links and redirects never drift apart. */
export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  onboarding: {
    university: "/onboarding/university",
    universityDocuments: "/onboarding/university-documents",
    transcript: "/onboarding/transcript",
    complete: "/onboarding/complete",
  },
  app: {
    overview: "/app",
    plan: "/app/plan",
    whatIf: "/app/what-if",
    courses: "/app/courses",
    sources: "/app/sources",
    advisor: "/app/advisor",
  },
  admin: {
    dashboard: "/admin",
    universities: "/admin/universities",
    courses: "/admin/courses",
    students: "/admin/students",
  },
} as const

/** In-page anchors for the landing page sections. */
export const SECTION_IDS = {
  features: "features",
  howItWorks: "how-it-works",
  about: "about",
  getStarted: "get-started",
} as const
