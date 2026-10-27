import { useState } from "react"
import { Eye } from "lucide-react"

import { DataTable, type Column } from "@/components/admin/data-table"
import { DetailSheet } from "@/components/admin/detail-sheet"
import { StudentDetails } from "@/components/admin/student/student-details"
import { EmptyResults, FilterSelect, ResultCount, SearchField, TableToolbar } from "@/components/admin/table-parts"
import { AppPageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import type { AdminStudent } from "@/mock/admin/students"
import { selectAdminData } from "@/store/slices/admin/admin-slice"
import { formatDate } from "@/lib/admin/format"
import { universityById } from "@/lib/admin/selectors"
import { useAppSelector } from "@/store/hooks"

export function StudentsPage() {
  const state = useAppSelector(selectAdminData)
  const universities = universityById(state)
  const [query, setQuery] = useState("")
  const [universityId, setUniversityId] = useState("all")
  const [viewing, setViewing] = useState<AdminStudent | null>(null)

  const rows = state.students.filter((student) => {
    const q = query.trim().toLowerCase()
    const matches = !q || student.name.toLowerCase().includes(q) || student.email.toLowerCase().includes(q)
    return matches && (universityId === "all" || student.universityId === universityId)
  })

  const studentUniversities = state.universities
    .filter((u) => state.students.some((s) => s.universityId === u.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const clearFilters = () => {
    setQuery("")
    setUniversityId("all")
  }

  const columns: Column<AdminStudent>[] = [
    {
      id: "name",
      header: "Student",
      sortValue: (s) => s.name,
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
      sortValue: (s) => universities.get(s.universityId)?.name ?? "",
      cell: (s) => <span className="text-[13px] text-muted-foreground">{universities.get(s.universityId)?.name ?? "—"}</span>,
    },
    { id: "program", header: "Program", hideBelow: "lg", sortValue: (s) => s.program, cell: (s) => <span className="text-[13px] text-muted-foreground">{s.program}</span> },
    {
      id: "registered",
      header: "Registered",
      hideBelow: "sm",
      sortValue: (s) => s.registeredAt,
      cell: (s) => <span className="text-xs whitespace-nowrap text-muted-foreground">{formatDate(s.registeredAt)}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <title>Students · AcadPath admin</title>
      <AppPageHeader
        title="Students"
        description="Registered students, their universities, and their programs. Read-only — students manage their own accounts."
      />

      <TableToolbar>
        <SearchField id="student-search" label="Search" value={query} onChange={setQuery} placeholder="Name or email" />
        <FilterSelect
          id="student-university"
          label="University"
          value={universityId}
          onChange={setUniversityId}
          options={[{ value: "all", label: "All universities" }, ...studentUniversities.map((u) => ({ value: u.id, label: u.name }))]}
        />
      </TableToolbar>

      <ResultCount shown={rows.length} total={state.students.length} noun="students" />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(s) => s.id}
        caption="Registered students"
        initialSort={{ id: "registered", direction: "desc" }}
        pageSize={12}
        empty={<EmptyResults onClear={clearFilters} />}
        actions={(s) => (
          <Button variant="ghost" size="sm" onClick={() => setViewing(s)}>
            <Eye data-icon="inline-start" aria-hidden="true" />
            View
            <span className="sr-only"> {s.name}</span>
          </Button>
        )}
      />

      <DetailSheet
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing?.name}
        description={viewing?.email}
      >
        {viewing ? <StudentDetails student={viewing} /> : null}
      </DetailSheet>
    </div>
  )
}
