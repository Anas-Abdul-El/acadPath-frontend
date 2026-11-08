import { useState } from "react"
import { Eye } from "lucide-react"

import { useAdminStudents, useUniversityOptions } from "@/api/admin"
import type { AdminStudentDto, StudentStage } from "@/api/types"
import { DataTable, type Column } from "@/components/admin/data-table"
import { DetailSheet } from "@/components/admin/detail-sheet"
import { StatusBadge } from "@/components/admin/status-badge"
import { StudentDetails } from "@/components/admin/student/student-details"
import { EmptyResults, FilterSelect, ResultCount, SearchField, TableToolbar } from "@/components/admin/table-parts"
import { AppPageHeader } from "@/components/shared/page-header"
import { QueryError, Skeleton } from "@/components/shared/query-state"
import { Button } from "@/components/ui/button"
import { useListParams } from "@/hooks/use-list-params"
import { formatDate } from "@/lib/admin/format"
import { STAGE } from "@/lib/admin/tones"

const PAGE_SIZE = 20
const FILTERS = ["university", "stage"] as const
const STAGES = Object.keys(STAGE) as StudentStage[]

export function StudentsPage() {
  const list = useListParams(FILTERS)
  const universityId = list.filters.university
  const stage = STAGES.find((s) => s === list.filters.stage)
  const universities = useUniversityOptions()
  const students = useAdminStudents({
    page: list.page,
    pageSize: PAGE_SIZE,
    q: list.q,
    universityId: universityId || undefined,
    stage,
  })
  const [viewing, setViewing] = useState<AdminStudentDto | null>(null)

  const rows = students.data?.data ?? []
  const meta = students.data?.meta

  const columns: Column<AdminStudentDto>[] = [
    {
      id: "name",
      header: "Student",
      cell: (s) => (
        <button type="button" onClick={() => setViewing(s)} className="text-left">
          <span className="block text-[13px] font-medium text-foreground hover:text-primary hover:underline">{s.name}</span>
          <span className="text-xs text-muted-foreground">{s.email}</span>
        </button>
      ),
    },
    {
      id: "university",
      header: "University",
      hideBelow: "md",
      cell: (s) => (
        <span className="text-[13px] text-muted-foreground">
          {s.university?.name ?? "—"}
          {s.major ? <span className="block text-xs">{s.major.name}</span> : null}
        </span>
      ),
    },
    {
      id: "stage",
      header: "Records",
      hideBelow: "lg",
      cell: (s) => <StatusBadge tone={STAGE[s.stage].tone}>{STAGE[s.stage].label}</StatusBadge>,
    },
    {
      id: "registered",
      header: "Registered",
      hideBelow: "sm",
      cell: (s) => <span className="text-xs whitespace-nowrap text-muted-foreground">{formatDate(s.registeredAt)}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <title>Students · AcadPath admin</title>
      <AppPageHeader
        title="Students"
        description="Registered students, their universities, and their majors. Read-only — students manage their own accounts."
      />

      <TableToolbar>
        <SearchField
          id="student-search"
          label="Search"
          value={list.q}
          onChange={(q) => list.set({ q })}
          placeholder="Name or email"
          debounceMs={300}
        />
        <FilterSelect
          id="student-university"
          label="University"
          value={universityId || "all"}
          onChange={(university) => list.set({ university })}
          options={[
            { value: "all", label: "All universities" },
            ...(universities.data?.data ?? []).map((u) => ({ value: u.id, label: u.name })),
          ]}
        />
        <FilterSelect
          id="student-stage"
          label="Records"
          value={stage ?? "all"}
          onChange={(value) => list.set({ stage: value })}
          options={[{ value: "all", label: "Any stage" }, ...STAGES.map((s) => ({ value: s, label: STAGE[s].label }))]}
        />
      </TableToolbar>

      {students.error ? (
        <QueryError error={students.error} onRetry={() => students.refetch()} title="We couldn't load students" />
      ) : !meta ? (
        <Skeleton className="h-96 w-full rounded-lg" />
      ) : (
        <>
          <ResultCount shown={meta.total} total={meta.total} noun={meta.total === 1 ? "student" : "students"} />
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(s) => s.id}
            caption="Registered students"
            pagination={{ page: meta.page, pageSize: meta.pageSize, total: meta.total, onPageChange: (page) => list.set({ page }) }}
            busy={students.isPlaceholderData}
            empty={list.hasFilters ? <EmptyResults onClear={list.clear} /> : <EmptyResults message="No students have registered yet." />}
            actions={(s) => (
              <Button variant="ghost" size="sm" onClick={() => setViewing(s)}>
                <Eye data-icon="inline-start" aria-hidden="true" />
                View
                <span className="sr-only"> {s.name}</span>
              </Button>
            )}
          />
        </>
      )}

      <DetailSheet
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing?.name}
        description={viewing?.email}
      >
        {viewing ? <StudentDetails key={viewing.id} student={viewing} /> : null}
      </DetailSheet>
    </div>
  )
}
