import {
  BookOpenCheck,
  CalendarRange,
  Compass,
  GitBranch,
  ListChecks,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react"

import { ROUTES, SECTION_IDS } from "@/lib/routes"

export type NavLink = {
  label: string
  href: string
}

export const primaryNav: NavLink[] = [
  { label: "Features", href: `#${SECTION_IDS.features}` },
  { label: "How It Works", href: `#${SECTION_IDS.howItWorks}` },
  { label: "About", href: `#${SECTION_IDS.about}` },
]

export type FeatureId = "planning" | "what-if" | "guidance" | "resources"

export type Feature = {
  id: FeatureId
  icon: LucideIcon
  title: string
  description: string
  benefit: string
}

export const features: Feature[] = [
  {
    id: "planning",
    icon: CalendarRange,
    title: "Academic Planning",
    description:
      "Lay out every remaining semester against your program’s degree requirements, credit limits, and course offering schedule.",
    benefit: "Know exactly which courses get you to graduation — and when.",
  },
  {
    id: "what-if",
    icon: GitBranch,
    title: "What-If Analysis",
    description:
      "Test a grade outcome, a retake, a minor, or a lighter term and see the effect on your GPA and graduation date before you commit.",
    benefit: "Make course decisions with the consequences in plain view.",
  },
  {
    id: "guidance",
    icon: Sparkles,
    title: "AI-Powered Course Guidance",
    description:
      "Ask about electives, sequencing, or workload. Recommendations are checked against prerequisites and your record, with the reasoning shown.",
    benefit: "Advice that respects the rules of your degree, not generic tips.",
  },
  {
    id: "resources",
    icon: BookOpenCheck,
    title: "Personalized Learning Resources",
    description:
      "Struggling in a course or retaking one? Get curated videos, courses, and practice sets from YouTube, Coursera, and Udemy matched to the topics you need.",
    benefit: "Spend study time on material that targets your weak spots.",
  },
]

export type Step = {
  number: string
  icon: LucideIcon
  title: string
  description: string
  details: string[]
}

export const steps: Step[] = [
  {
    number: "01",
    icon: ListChecks,
    title: "Add Your Academic Record",
    description:
      "Select your program and catalog year, then enter the courses you’ve completed and the grades you earned.",
    details: ["Program & catalog year", "Completed courses & grades", "Transfer credits"],
  },
  {
    number: "02",
    icon: Compass,
    title: "Explore Your Options",
    description:
      "Compare paths side by side — different electives, a minor, a summer term — and see how each one changes your timeline.",
    details: ["What-if GPA scenarios", "Prerequisite checks", "AI course guidance"],
  },
  {
    number: "03",
    icon: CalendarRange,
    title: "Build Your Plan",
    description:
      "Lock in a semester-by-semester plan through graduation and keep it current as grades and offerings change.",
    details: ["Semester-by-semester plan", "Graduation date estimate", "Learning resources"],
  },
]

export type Principle = {
  icon: LucideIcon
  title: string
  description: string
}

export const principles: Principle[] = [
  {
    icon: ListChecks,
    title: "Grounded in your degree catalog",
    description:
      "Plans are built from program requirements, prerequisite chains, and credit rules — the same structure advisors work from.",
  },
  {
    icon: ShieldCheck,
    title: "Advice you can verify",
    description:
      "Every recommendation shows why it was made, so students and advisors can check it instead of taking it on faith.",
  },
  {
    icon: UsersRound,
    title: "Built for students and staff",
    description:
      "Students plan on their own time; administrators keep course data and resources current for everyone.",
  },
]

export type FooterGroup = {
  title: string
  links: NavLink[]
}

export const footerGroups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: `#${SECTION_IDS.features}` },
      { label: "How It Works", href: `#${SECTION_IDS.howItWorks}` },
      { label: "About", href: `#${SECTION_IDS.about}` },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: ROUTES.signIn },
      { label: "Get Started", href: ROUTES.signUp },
    ],
  },
]
