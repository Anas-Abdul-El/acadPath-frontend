import { ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

import { DetailList, DetailSection } from "@/components/admin/detail-sheet"
import type { AdminUniversity } from "@/mock/admin/universities"
import { selectAdminData } from "@/store/slices/admin/admin-slice"
import { formatDate } from "@/lib/admin/format"
import { studentCountByUniversity } from "@/lib/admin/selectors"
import { ROUTES } from "@/lib/routes"
import { useAppSelector } from "@/store/hooks"

export function UniversityDetails({ university }: { university: AdminUniversity }) {
  const state = useAppSelector(selectAdminData)
  const studentCounts = studentCountByUniversity(state)
  const courses = state.courses.filter((c) => c.universityId === university.id)
  return (
    <>
      <DetailSection title="Overview">
        <DetailList
          items={[
            { label: "Abbreviation", value: university.shortName ?? "—" },
            {
              label: "Catalog website",
              value: university.website ? (
                <a href={university.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
                  {university.website.replace(/^https?:\/\//, "")}
                  <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                "—"
              ),
            },
            { label: "Catalog year", value: university.catalogYear ?? "—" },
            { label: "Students", value: studentCounts.get(university.id) ?? 0 },
            { label: "Added", value: formatDate(university.addedAt) },
          ]}
        />
      </DetailSection>

      <DetailSection
        title={`Courses (${courses.length})`}
        action={
          courses.length ? (
            <Link to={`${ROUTES.admin.courses}?university=${university.id}`} className="text-xs font-medium text-primary hover:underline">
              Manage courses
            </Link>
          ) : null
        }
      >
        {courses.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {courses.slice(0, 6).map((course) => (
              <li key={course.id} className="flex items-baseline gap-3 px-4 py-2">
                <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{course.code}</span>
                <span className="min-w-0 truncate text-foreground">{course.title}</span>
              </li>
            ))}
            {courses.length > 6 ? <li className="px-4 py-2 text-xs text-muted-foreground">+ {courses.length - 6} more</li> : null}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">No courses added yet.</p>
        )}
      </DetailSection>
    </>
  )
}
