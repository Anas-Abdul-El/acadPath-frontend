import { BookOpen, Building2, LayoutDashboard, Users } from "lucide-react"

import type { AppNavItem } from "@/data/app-navigation"
import { ROUTES } from "@/lib/routes"

export const adminNavigation: AppNavItem[] = [
  { label: "Dashboard", to: ROUTES.admin.dashboard, icon: LayoutDashboard, description: "Platform overview" },
  { label: "Universities", to: ROUTES.admin.universities, icon: Building2, description: "Manage universities" },
  { label: "Courses", to: ROUTES.admin.courses, icon: BookOpen, description: "Manage courses" },
  { label: "Students", to: ROUTES.admin.students, icon: Users, description: "Registered students" },
]
