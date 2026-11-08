import { useState } from "react"
import { Plus } from "lucide-react"

import { useAdminUniversities, useDeleteUniversity } from "@/api/admin"
import type { AdminUniversityDto, CatalogStatus } from "@/api/types"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { DataTable, type Column } from "@/components/admin/data-table"
import { DetailSheet } from "@/components/admin/detail-sheet"
import { FormDialog } from "@/components/admin/form-dialog"
import { RowActions } from "@/components/admin/row-actions"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyResults, FilterSelect, ResultCount, SearchField, TableToolbar } from "@/components/admin/table-parts"
import { UniversityDetails } from "@/components/admin/university/university-details"
import { UniversityForm } from "@/components/admin/university/university-form"
import { AppPageHeader } from "@/components/shared/page-header"
import { QueryError, Skeleton } from "@/components/shared/query-state"
import { Button } from "@/components/ui/button"
import { useListParams } from "@/hooks/use-list-params"
import { useToast } from "@/hooks/use-toast"
import { CATALOG_STATUS_TONE } from "@/lib/admin/tones"
import { pluralize } from "@/lib/files/format"
import { CATALOG_STATUS_LABEL } from "@/lib/labels"

const PAGE_SIZE = 20
const FILTERS = ["catalog"] as const
const CATALOG_STATUSES = Object.keys(CATALOG_STATUS_LABEL) as CatalogStatus[]

export function UniversitiesPage() {
  const toast = useToast()
  const list = useListParams(FILTERS)
  const catalogStatus = CATALOG_STATUSES.find((status) => status === list.filters.catalog)
  const universities = useAdminUniversities({ page: list.page, pageSize: PAGE_SIZE, q: list.q, catalogStatus })
  const deleteUniversity = useDeleteUniversity()

  const [viewing, setViewing] = useState<AdminUniversityDto | null>(null)
  const [editing, setEditing] = useState<AdminUniversityDto | "new" | null>(null)
  const [deleting, setDeleting] = useState<AdminUniversityDto | null>(null)

  const rows = universities.data?.data ?? []
  const meta = universities.data?.meta

  const confirmDelete = () => {
    const university = deleting
    if (!university) return
    setDeleting(null)
    deleteUniversity.mutate(university.id, {
      onSuccess: () => {
        if (viewing?.id === university.id) setViewing(null)
        toast({ tone: "success", title: "University deleted", description: `${university.name} and its courses were removed.` })
      },
    })
  }

  const columns: Column<AdminUniversityDto>[] = [
    {
      id: "name",
      header: "University",
      cell: (u) => (
        <button type="button" onClick={() => setViewing(u)} className="text-left">
          <span className="block text-[13px] font-medium text-foreground hover:text-primary hover:underline">{u.name}</span>
          <span className="text-xs text-muted-foreground">
            {[u.shortName, `${u.city}, ${u.country}`].filter(Boolean).join(" · ")}
          </span>
        </button>
      ),
    },
    {
      id: "catalog",
      header: "Catalog",
      hideBelow: "md",
      cell: (u) => <StatusBadge tone={CATALOG_STATUS_TONE[u.catalogStatus]}>{CATALOG_STATUS_LABEL[u.catalogStatus]}</StatusBadge>,
    },
    {
      id: "majors",
      header: "Majors",
      align: "right",
      hideBelow: "lg",
      cell: (u) => <span className="font-mono text-xs text-foreground font-tabular">{u.majorCount}</span>,
    },
    {
      id: "courses",
      header: "Courses",
      align: "right",
      cell: (u) => <span className="font-mono text-xs text-foreground font-tabular">{u.courseCount}</span>,
    },
    {
      id: "students",
      header: "Students",
      align: "right",
      hideBelow: "sm",
      cell: (u) => <span className="font-mono text-xs text-foreground font-tabular">{u.studentCount}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <title>Universities · AcadPath admin</title>
      <AppPageHeader
        title="Universities"
        description="Universities on AcadPath, their majors and catalogs, and the courses recorded for each."
        actions={
          <Button size="lg" onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add university
          </Button>
        }
      />

      <TableToolbar>
        <SearchField
          id="university-search"
          label="Search"
          value={list.q}
          onChange={(q) => list.set({ q })}
          placeholder="Name, abbreviation, city, or country"
          debounceMs={300}
        />
        <FilterSelect
          id="university-catalog"
          label="Catalog"
          value={catalogStatus ?? "all"}
          onChange={(catalog) => list.set({ catalog })}
          options={[
            { value: "all", label: "Any catalog status" },
            ...CATALOG_STATUSES.map((status) => ({ value: status, label: CATALOG_STATUS_LABEL[status] })),
          ]}
        />
      </TableToolbar>

      {universities.error ? (
        <QueryError error={universities.error} onRetry={() => universities.refetch()} title="We couldn't load universities" />
      ) : !meta ? (
        <Skeleton className="h-96 w-full rounded-lg" />
      ) : (
        <>
          <ResultCount shown={meta.total} total={meta.total} noun={meta.total === 1 ? "university" : "universities"} />
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(u) => u.id}
            caption="Universities"
            pagination={{ page: meta.page, pageSize: meta.pageSize, total: meta.total, onPageChange: (page) => list.set({ page }) }}
            busy={universities.isPlaceholderData}
            empty={
              list.hasFilters ? (
                <EmptyResults onClear={list.clear} />
              ) : (
                <EmptyResults message="No universities yet. Add one, or they'll appear as students sign up." />
              )
            }
            actions={(u) => (
              <RowActions name={u.name} onView={() => setViewing(u)} onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)} />
            )}
          />
        </>
      )}

      <DetailSheet
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
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
        {viewing ? <UniversityDetails universityId={viewing.id} /> : null}
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
            onCancel={() => setEditing(null)}
            onSaved={(saved) => {
              const isNew = editing === "new"
              setEditing(null)
              if (viewing?.id === saved.id) setViewing(saved)
              toast({ tone: "success", title: isNew ? "University added" : "University updated", description: saved.name })
            }}
          />
        ) : null}
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description={
          deleting ? (
            <>
              <p>
                This also deletes its {pluralize(deleting.majorCount, "major")} and {pluralize(deleting.courseCount, "course")}.
                You can&rsquo;t undo this.
              </p>
              {deleting.studentCount > 0 ? (
                <p className="mt-2">
                  {pluralize(deleting.studentCount, "student")} will lose this university from their profile, and study plans
                  that use its courses are deleted.
                </p>
              ) : null}
            </>
          ) : null
        }
        destructive
        confirmLabel="Delete university"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
