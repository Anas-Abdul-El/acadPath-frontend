import { lazy, Suspense, useMemo } from "react"
import { ArrowRight, BookOpen, Building2, Users, type LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { useAdminStats, useAdminStudents } from "@/api/admin"
import type { AdminStatsDto, CatalogStatus, ProcessingStatus } from "@/api/types"
import type { RegistrationPoint } from "@/components/admin/dashboard/registrations-plot"
import { StatusBadge } from "@/components/admin/status-badge"
import { AppPageHeader } from "@/components/shared/page-header"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { QueryError, Skeleton } from "@/components/shared/query-state"
import { StatTile } from "@/components/shared/stat-tile"
import { Button } from "@/components/ui/button"
import { formatRelative } from "@/lib/admin/format"
import { CATALOG_STATUS_TONE, PROCESSING_STATUS_TONE } from "@/lib/admin/tones"
import { CATALOG_STATUS_LABEL, PROCESSING_STATUS_LABEL } from "@/lib/labels"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

const RegistrationsPlot = lazy(() => import("@/components/admin/dashboard/registrations-plot"))

const MONTHS = 8
const monthShort = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" })
const monthLong = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" })

/** "2026-03" → { label: "Mar", title: "March 2026" } */
function toRegistrationPoints(data: AdminStatsDto["registrationsByMonth"]): RegistrationPoint[] {
  return data.map(({ month, count }) => {
    const date = new Date(`${month}-01T00:00:00Z`)
    return { month, count, label: monthShort.format(date), title: monthLong.format(date) }
  })
}

const CATALOG_ORDER: CatalogStatus[] = ["AVAILABLE", "PROCESSING", "UNAVAILABLE"]
const SOURCE_ORDER: ProcessingStatus[] = ["COMPLETED", "PROCESSING", "PENDING", "FAILED"]
const CATALOG_BAR: Record<CatalogStatus, string> = {
  AVAILABLE: "bg-success",
  PROCESSING: "bg-primary",
  UNAVAILABLE: "bg-warning",
}

export function AdminDashboardPage() {
  const stats = useAdminStats(MONTHS)
  const recent = useAdminStudents({ page: 1, pageSize: 6 })
  const monthly = useMemo(() => toRegistrationPoints(stats.data?.registrationsByMonth ?? []), [stats.data])

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

      {stats.error ? (
        <QueryError error={stats.error} onRetry={() => stats.refetch()} title="We couldn't load platform stats" />
      ) : !stats.data ? (
        <div role="status" aria-label="Loading dashboard" className="space-y-6">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      ) : (
        <StatsSection stats={stats.data} monthly={monthly} />
      )}

      <DashboardCard
        title="Recent student registrations"
        subtitle="Newest accounts first"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.admin.students}>View all</Link>
          </Button>
        }
      >
        {recent.error ? (
          <QueryError error={recent.error} onRetry={() => recent.refetch()} />
        ) : !recent.data ? (
          <Skeleton className="h-48 w-full" />
        ) : recent.data.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students have registered yet.</p>
        ) : (
          <div className="relative -mx-4 overflow-x-auto sm:-mx-5">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Recent student registrations</caption>
              <thead>
                <tr className="border-y border-border text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="py-2 pr-3 pl-4 font-medium sm:pl-5">
                    Student
                  </th>
                  <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">
                    University
                  </th>
                  <th scope="col" className="py-2 pr-4 pl-3 font-medium sm:pr-5">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.data.data.map((student) => (
                  <tr key={student.id} className="border-b border-border/70 last:border-b-0">
                    <td className="py-2.5 pr-3 pl-4 sm:pl-5">
                      <p className="text-[13px] font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </td>
                    <td className="hidden px-3 py-2.5 text-[13px] text-muted-foreground md:table-cell">
                      {student.university?.name ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 pl-3 text-xs whitespace-nowrap text-muted-foreground sm:pr-5">
                      {formatRelative(student.registeredAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

function StatsSection({ stats, monthly }: { stats: AdminStatsDto; monthly: RegistrationPoint[] }) {
  const { counts } = stats
  const thisMonth = monthly.at(-1)
  const lastMonth = monthly.at(-2)
  const universityTotal = CATALOG_ORDER.reduce((sum, status) => sum + stats.universitiesByCatalogStatus[status], 0)

  const quickActions: { to: string; icon: LucideIcon; label: string; detail: string }[] = [
    { to: ROUTES.admin.universities, icon: Building2, label: "Manage universities", detail: `${counts.universities} universities · ${counts.majors} majors` },
    { to: ROUTES.admin.courses, icon: BookOpen, label: "Manage courses", detail: `${counts.courses} courses` },
    { to: ROUTES.admin.students, icon: Users, label: "View students", detail: `${counts.students} registered` },
  ]

  return (
    <>
      <section
        aria-label="Platform totals"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4"
      >
        <StatTile
          label="Registered students"
          value={counts.students}
          footer={
            thisMonth && lastMonth
              ? `${thisMonth.count} this month · ${lastMonth.count} in ${lastMonth.title.split(" ")[0]}`
              : "Across all universities"
          }
        />
        <StatTile label="Universities" value={counts.universities} footer={`${counts.majors} majors`} />
        <StatTile label="Courses" value={counts.courses} footer={`Across ${counts.majors} majors`} />
        <StatTile
          label="AI-captured courses"
          value={counts.aiExtractedCourses}
          footer={
            <Link
              to={`${ROUTES.admin.courses}?source=AI_EXTRACTED`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              From uploaded documents
              <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          }
        />
      </section>

      <DashboardCard title="New registrations" subtitle={`Students per month · last ${monthly.length} months`}>
        <div className="h-56" aria-hidden="true">
          <Suspense fallback={<div className="size-full animate-pulse rounded-md bg-muted" />}>
            <RegistrationsPlot data={monthly} />
          </Suspense>
        </div>
        <table className="sr-only">
          <caption>New student registrations per month</caption>
          <tbody>
            {monthly.map((point) => (
              <tr key={point.month}>
                <th scope="row">{point.title}</th>
                <td>{point.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard
          title="Catalog coverage"
          subtitle="Universities by course-catalog status"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.admin.universities}>Manage</Link>
            </Button>
          }
        >
          {universityTotal > 0 ? (
            <div
              className="flex h-2.5 overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label={CATALOG_ORDER.map((s) => `${stats.universitiesByCatalogStatus[s]} ${CATALOG_STATUS_LABEL[s].toLowerCase()}`).join(", ")}
            >
              {CATALOG_ORDER.map((status) => (
                <span
                  key={status}
                  className={cn("h-full", CATALOG_BAR[status])}
                  style={{ width: `${(stats.universitiesByCatalogStatus[status] / universityTotal) * 100}%` }}
                />
              ))}
            </div>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {CATALOG_ORDER.map((status) => (
              <li key={status} className="flex items-center justify-between gap-3">
                <Link
                  to={`${ROUTES.admin.universities}?catalog=${status}`}
                  className="rounded-sm hover:underline"
                >
                  <StatusBadge tone={CATALOG_STATUS_TONE[status]}>{CATALOG_STATUS_LABEL[status]}</StatusBadge>
                </Link>
                <span className="font-mono text-foreground font-tabular">{stats.universitiesByCatalogStatus[status]}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">Catalog sources</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {SOURCE_ORDER.map((status) => (
                <li key={status} className="inline-flex items-center gap-1.5">
                  <StatusBadge tone={PROCESSING_STATUS_TONE[status]}>{PROCESSING_STATUS_LABEL[status]}</StatusBadge>
                  <span className="font-mono text-foreground font-tabular">{stats.sourcesByStatus[status]}</span>
                </li>
              ))}
            </ul>
          </div>
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
    </>
  )
}
