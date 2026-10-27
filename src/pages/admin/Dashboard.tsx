import { lazy, Suspense } from "react"
import { ArrowRight, BookOpen, Building2, Users, type LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { AppPageHeader } from "@/components/shared/page-header"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { StatTile } from "@/components/shared/stat-tile"
import { Button } from "@/components/ui/button"
import { COURSE_CATEGORIES } from "@/mock/academic/course-catalog"
import { selectAdminData } from "@/store/slices/admin/admin-slice"
import { formatRelative } from "@/lib/admin/format"
import { registrationsByMonth, universityById } from "@/lib/admin/selectors"
import { ROUTES } from "@/lib/routes"
import { useAppSelector } from "@/store/hooks"

const RegistrationsPlot = lazy(() => import("@/components/admin/dashboard/registrations-plot"))

export function AdminDashboardPage() {
  const state = useAppSelector(selectAdminData)
  const universities = universityById(state)
  const aiCourses = state.courses.filter((c) => c.capturedByAi).length
  const monthly = registrationsByMonth(state)
  const thisMonth = monthly[monthly.length - 1].count
  const lastMonth = monthly[monthly.length - 2].count

  const recentStudents = [...state.students].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 6)
  const recentCourses = [...state.courses].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const countryCount = new Set(state.universities.map((u) => u.country)).size

  const quickActions: { to: string; icon: LucideIcon; label: string; detail: string }[] = [
    { to: ROUTES.admin.universities, icon: Building2, label: "Manage universities", detail: `${state.universities.length} universities` },
    { to: ROUTES.admin.courses, icon: BookOpen, label: "Manage courses", detail: `${state.courses.length} courses` },
    { to: ROUTES.admin.students, icon: Users, label: "View students", detail: `${state.students.length} registered` },
  ]

  return (
    <div className="space-y-6">
      <title>Admin dashboard · AcadPath</title>
      <AppPageHeader
        title="Dashboard"
        description="Platform activity across students, universities, and courses."
        actions={
          <Button asChild size="lg">
            <Link to={ROUTES.admin.universities}>
              Manage universities
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      <section aria-label="Platform totals" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
        <StatTile
          label="Registered students"
          value={state.students.length}
          footer={`${thisMonth} this month · ${lastMonth} in September`}
        />
        <StatTile
          label="Universities"
          value={state.universities.length}
          footer={`Across ${countryCount} countries`}
        />
        <StatTile label="Courses" value={state.courses.length} footer={`Across ${new Set(state.courses.map((c) => c.universityId)).size} universities`} />
        <StatTile
          label="AI-captured courses"
          value={aiCourses}
          footer={
            <Link to={ROUTES.admin.courses} className="inline-flex items-center gap-1 text-primary hover:underline">
              From student-uploaded documents
              <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          }
        />
      </section>

      <DashboardCard title="New registrations" subtitle="Students per month · 2026">
        <div className="h-56" aria-hidden="true">
          <Suspense fallback={<div className="size-full animate-pulse rounded-md bg-muted" />}>
            <RegistrationsPlot data={monthly} />
          </Suspense>
        </div>
        <table className="sr-only">
          <caption>New student registrations per month in 2026</caption>
          <tbody>
            {monthly.map((point) => (
              <tr key={point.month}>
                <th scope="row">{point.month}</th>
                <td>{point.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>

      <DashboardCard
        title="Recent student registrations"
        subtitle="Newest accounts first"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.admin.students}>View all</Link>
          </Button>
        }
      >
        <div className="relative -mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Recent student registrations</caption>
            <thead>
              <tr className="border-y border-border text-[11px] tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="py-2 pr-3 pl-4 font-medium sm:pl-5">Student</th>
                <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">University</th>
                <th scope="col" className="py-2 pr-4 pl-3 font-medium sm:pr-5">Registered</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((student) => (
                <tr key={student.id} className="border-b border-border/70 last:border-b-0">
                  <td className="py-2.5 pr-3 pl-4 sm:pl-5">
                    <p className="text-[13px] font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </td>
                  <td className="hidden px-3 py-2.5 text-[13px] text-muted-foreground md:table-cell">
                    {universities.get(student.universityId)?.name ?? "—"}
                  </td>
                  <td className="py-2.5 pr-4 pl-3 text-xs whitespace-nowrap text-muted-foreground sm:pr-5">
                    {formatRelative(student.registeredAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard
          title="Recently updated courses"
          subtitle="Latest catalog changes"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.admin.courses}>Manage</Link>
            </Button>
          }
        >
          <ul className="-my-1 divide-y divide-border/70">
            {recentCourses.map((course) => (
              <li key={course.id} className="py-2.5">
                <p className="text-[13px] text-foreground">
                  <span className="font-mono text-xs text-muted-foreground">{course.code}</span> {course.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {universities.get(course.universityId)?.shortName ?? universities.get(course.universityId)?.name} ·{" "}
                  {COURSE_CATEGORIES[course.category].label} · {formatRelative(course.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="Quick actions" subtitle="Jump to a management section">
          <ul className="space-y-2">
            {quickActions.map(({ to, icon: Icon, label, detail }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="group flex items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/60"
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-foreground">{label}</span>
                    <span className="block text-[11px] text-muted-foreground">{detail}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  )
}
