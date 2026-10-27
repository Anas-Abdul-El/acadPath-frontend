import {
  BookOpen,
  CalendarRange,
  GitBranch,
  LayoutDashboard,
  LibraryBig,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/routes"

export type AppNavItem = {
  label: string
  icon: LucideIcon
  description: string
  /** Omitted for sections that aren't available yet. */
  to?: string
}

/** Primary app navigation — same order and icons as the landing-page preview sidebar. */
export const appNavigation: AppNavItem[] = [
  {
    label: "Overview",
    to: ROUTES.app.overview,
    icon: LayoutDashboard,
    description: "Your GPA, credits, and progress toward graduation at a glance.",
  },
  {
    label: "Semester Plan",
    to: ROUTES.app.plan,
    icon: CalendarRange,
    description: "Your AI-generated, semester-by-semester path to graduation.",
  },
  {
    label: "What-If Analysis",
    to: ROUTES.app.whatIf,
    icon: GitBranch,
    description: "Describe a change and see how it affects your GPA, credits, and graduation date.",
  },
  {
    label: "Courses",
    to: ROUTES.app.courses,
    icon: BookOpen,
    description: "Every course in your major's catalog, with credits, prerequisites, and requirements.",
  },
  {
    label: "Sources",
    to: ROUTES.app.sources,
    icon: LibraryBig,
    description: "Learning resources for difficult courses, plus practice quizzes.",
  },
  {
    label: "AI Advisor",
    to: ROUTES.app.advisor,
    icon: Sparkles,
    description: "Ask questions about your courses, GPA, and plan.",
  },
]
