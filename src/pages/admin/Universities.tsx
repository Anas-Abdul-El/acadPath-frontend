import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { DataTable, type Column } from "@/components/admin/data-table"
import { DetailSheet } from "@/components/admin/detail-sheet"
import { FormDialog } from "@/components/admin/form-dialog"
import { RowActions } from "@/components/admin/row-actions"
import { EmptyResults, FilterSelect, ResultCount, SearchField, TableToolbar } from "@/components/admin/table-parts"
import { UniversityDetails } from "@/components/admin/university/university-details"
import { UniversityForm } from "@/components/admin/university/university-form"
import { AppPageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import type { AdminUniversity } from "@/mock/admin/universities"
import { selectAdminData, universityDeleted, universitySaved } from "@/store/slices/admin/admin-slice"
import { courseCountByUniversity, studentCountByUniversity } from "@/lib/admin/selectors"
import { pluralize } from "@/lib/files/format"
import type { AdminUniversityValues } from "@/schemas/admin"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

const slug = (name: string) =>
  normalize(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32)

export function UniversitiesPage() {
  const state = useAppSelector(selectAdminData)
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("all")
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminUniversity | "new" | null>(null)
  const [deleting, setDeleting] = useState<AdminUniversity | null>(null)

  const courseCounts = courseCountByUniversity(state)
  const studentCounts = studentCountByUniversity(state)
  const countries = useMemo(
    () => [...new Set(state.universities.map((u) => u.country))].sort((a, b) => a.localeCompare(b)),
    [state.universities],
  )

  const rows = state.universities.filter((u) => {
    const q = normalize(query.trim())
    const matches = !q || [u.name, u.shortName ?? "", u.city, u.country].some((part) => normalize(part).includes(q))
    return matches && (country === "all" || u.country === country)
  })

  const viewing = state.universities.find((u) => u.id === viewingId) ?? null
  const clearFilters = () => {
    setQuery("")
    setCountry("all")
  }

  const save = (values: AdminUniversityValues) => {
    const existing = editing !== "new" ? editing : null
    const id = existing?.id ?? `${slug(values.name)}-${crypto.randomUUID().slice(0, 4)}`
    dispatch(
      universitySaved({
        id,
        name: values.name,
        shortName: values.shortName || undefined,
        country: values.country,
        city: values.city,
        website: values.website || undefined,
        catalogYear: values.catalogYear || undefined,
        addedAt: existing?.addedAt ?? new Date().toISOString().slice(0, 10),
      }),
    )
    setEditing(null)
    toast({
      tone: "success",
      title: existing ? "University updated" : "University added",
      description: `${values.name} was ${existing ? "saved" : "added"}. Sample data only — resets on refresh.`,
    })
  }

  const confirmDelete = () => {
    if (!deleting) return
    dispatch(universityDeleted(deleting.id))
    if (viewingId === deleting.id) setViewingId(null)
    toast({ tone: "success", title: "University deleted", description: `${deleting.name} and its courses were removed.` })
    setDeleting(null)
  }

  const columns: Column<AdminUniversity>[] = [
    {
      id: "name",
      header: "University",
      sortValue: (u) => u.name,
      cell: (u) => (
        <button type="button" onClick={() => setViewingId(u.id)} className="text-left">
          <span className="block text-[13px] font-medium text-foreground hover:text-primary hover:underline">{u.name}</span>
          {u.shortName ? <span className="text-xs text-muted-foreground">{u.shortName}</span> : null}
        </button>
      ),
    },
    { id: "country", header: "Country", sortValue: (u) => u.country, hideBelow: "md", cell: (u) => <span className="text-[13px] text-muted-foreground">{u.country}</span> },
    { id: "city", header: "City", sortValue: (u) => u.city, hideBelow: "lg", cell: (u) => <span className="text-[13px] text-muted-foreground">{u.city}</span> },
    {
      id: "courses",
      header: "Courses",
      align: "right",
      sortValue: (u) => courseCounts.get(u.id) ?? 0,
      cell: (u) => <span className="font-mono text-xs text-foreground font-tabular">{courseCounts.get(u.id) ?? 0}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <title>Universities · AcadPath admin</title>
      <AppPageHeader
        title="Universities"
        description="Universities on AcadPath, their catalogs, and the courses recorded for each."
        actions={
          <Button size="lg" onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add university
          </Button>
        }
      />

      <TableToolbar>
        <SearchField id="university-search" label="Search" value={query} onChange={setQuery} placeholder="Name, abbreviation, or city" />
        <FilterSelect
          id="university-country"
          label="Country"
          value={country}
          onChange={setCountry}
          options={[{ value: "all", label: "All countries" }, ...countries.map((c) => ({ value: c, label: c }))]}
        />
      </TableToolbar>

      <ResultCount shown={rows.length} total={state.universities.length} noun="universities" />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(u) => u.id}
        caption="Universities"
        initialSort={{ id: "name", direction: "asc" }}
        empty={<EmptyResults onClear={clearFilters} />}
        actions={(u) => (
          <RowActions name={u.name} onView={() => setViewingId(u.id)} onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)} />
        )}
      />

      <DetailSheet
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewingId(null)}
        title={viewing?.name}
        description={viewing ? `${viewing.city}, ${viewing.country}` : undefined}
        footer={
          viewing ? (
            <>
              <Button variant="outline" size="lg" onClick={() => setDeleting(viewing)} className="mr-auto text-destructive hover:text-destructive">
                Delete
              </Button>
              <Button size="lg" onClick={() => setEditing(viewing)}>
                Edit university
              </Button>
            </>
          ) : null
        }
      >
        {viewing ? <UniversityDetails university={viewing} /> : null}
      </DetailSheet>

      <FormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add university" : "Edit university"}
        description="Details shown to students in the University Finder and used to match catalogs."
      >
        {editing !== null ? (
          <UniversityForm
            key={editing === "new" ? "new" : editing.id}
            university={editing === "new" ? undefined : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting && (studentCounts.get(deleting.id) ?? 0) > 0 ? "This university can't be deleted" : `Delete ${deleting?.name}?`}
        description={
          deleting && (studentCounts.get(deleting.id) ?? 0) > 0 ? (
            <p>
              {pluralize(studentCounts.get(deleting.id) ?? 0, "student is", "students are")} registered at {deleting.name}. Deleting it
              would leave their profiles without a university.
            </p>
          ) : deleting ? (
            <p>
              This also removes its {pluralize(courseCounts.get(deleting.id) ?? 0, "course")}. You can't undo this.
            </p>
          ) : null
        }
        destructive
        confirmLabel="Delete university"
        onConfirm={deleting && (studentCounts.get(deleting.id) ?? 0) > 0 ? undefined : confirmDelete}
      />
    </div>
  )
}
