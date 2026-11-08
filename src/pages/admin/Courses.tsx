import { useState } from "react"
import { Plus, Sparkles } from "lucide-react"

import { useAdminCourses, useAdminMajors, useDeleteCourse, useUniversityOptions } from "@/api/admin"
import type { AdminCourseDto, CourseSource } from "@/api/types"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { CodeList } from "@/components/admin/courses/code-list"
import { CourseForm } from "@/components/admin/courses/course-form"
import { DataTable, type Column } from "@/components/admin/data-table"
import { DetailList, DetailSection, DetailSheet } from "@/components/admin/detail-sheet"
import { FormDialog } from "@/components/admin/form-dialog"
import { RowActions } from "@/components/admin/row-actions"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyResults, FilterSelect, ResultCount, SearchField, TableToolbar } from "@/components/admin/table-parts"
import { AppPageHeader } from "@/components/shared/page-header"
import { QueryError, Skeleton } from "@/components/shared/query-state"
import { Button } from "@/components/ui/button"
import { useListParams } from "@/hooks/use-list-params"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatRelative } from "@/lib/admin/format"
import { CATEGORY_TONE } from "@/lib/admin/tones"
import { CATEGORY_ORDER, categoryLabel, COURSE_SOURCE_LABEL, offeredLabel } from "@/lib/labels"

const PAGE_SIZE = 20
// `university` keeps the links other admin pages already use (`/admin/courses?university=<id>`).
const FILTERS = ["university", "major", "category", "source"] as const
const SOURCES = Object.keys(COURSE_SOURCE_LABEL) as CourseSource[]

const SOURCE_DESCRIPTION: Record<CourseSource, string> = {
  AI_EXTRACTED: "Captured by AI from uploaded documents",
  CATALOG_IMPORT: "Official catalog import",
  ADMIN: "Added by an admin",
}

export function CoursesAdminPage() {
  const toast = useToast()
  const list = useListParams(FILTERS)
  const { university: universityId, major: majorId } = list.filters
  const category = CATEGORY_ORDER.find((c) => c === list.filters.category)
  const source = SOURCES.find((s) => s === list.filters.source)

  const universities = useUniversityOptions()
  const majors = useAdminMajors(universityId || null)
  const courses = useAdminCourses({
    page: list.page,
    pageSize: PAGE_SIZE,
    q: list.q,
    universityId: universityId || undefined,
    majorId: majorId || undefined,
    category,
    source,
  })
  const deleteCourse = useDeleteCourse()

  const [viewing, setViewing] = useState<AdminCourseDto | null>(null)
  const [editing, setEditing] = useState<AdminCourseDto | "new" | null>(null)
  const [deleting, setDeleting] = useState<AdminCourseDto | null>(null)

  const rows = courses.data?.data ?? []
  const meta = courses.data?.meta

  const confirmDelete = () => {
    const course = deleting
    if (!course) return
    setDeleting(null)
    deleteCourse.mutate(course.id, {
      onSuccess: () => {
        if (viewing?.id === course.id) setViewing(null)
        toast({ tone: "success", title: "Course deleted", description: `${course.code} ${course.name} was removed.` })
      },
    })
  }

  const columns: Column<AdminCourseDto>[] = [
    {
      id: "code",
      header: "Code",
      cell: (c) => <span className="font-mono text-xs whitespace-nowrap text-foreground">{c.code}</span>,
    },
    {
      id: "name",
      header: "Course",
      className: "min-w-56",
      cell: (c) => (
        <button type="button" onClick={() => setViewing(c)} className="max-w-xs text-left">
          <span className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground hover:text-primary hover:underline">{c.name}</span>
            {c.source === "AI_EXTRACTED" ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-highlight/60 bg-highlight/15 px-1 font-mono text-[10px] text-highlight-foreground">
                <Sparkles aria-hidden="true" className="size-2.5" />
                AI<span className="sr-only">-captured</span>
              </span>
            ) : null}
          </span>
          {c.description ? <span className="line-clamp-1 text-xs text-muted-foreground">{c.description}</span> : null}
        </button>
      ),
    },
    {
      id: "university",
      header: "University · major",
      hideBelow: "md",
      cell: (c) => (
        <span className="text-[13px] text-muted-foreground" title={`${c.university.name} · ${c.major.name}`}>
          {c.university.shortName ?? c.university.name}
          <span className="block text-xs">{c.major.name}</span>
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      hideBelow: "lg",
      cell: (c) => <StatusBadge tone={CATEGORY_TONE[c.category]}>{categoryLabel(c.category)}</StatusBadge>,
    },
    {
      id: "credits",
      header: "Cr",
      align: "right",
      cell: (c) => <span className="font-mono text-xs text-foreground font-tabular">{c.credits}</span>,
    },
    {
      id: "prereqs",
      header: "Prerequisites",
      hideBelow: "lg",
      cell: (c) => <CodeList codes={c.prerequisites.map((p) => p.code)} />,
    },
    {
      id: "updated",
      header: "Updated",
      hideBelow: "sm",
      cell: (c) => <span className="text-xs whitespace-nowrap text-muted-foreground">{formatRelative(c.updatedAt)}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <title>Courses · AcadPath admin</title>
      <AppPageHeader
        title="Courses"
        description="Course records used to build students' plans: codes, credits, requisites, and requirement categories."
        actions={
          <Button size="lg" onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add course
          </Button>
        }
      />

      <TableToolbar>
        <SearchField
          id="course-search"
          label="Search"
          value={list.q}
          onChange={(q) => list.set({ q })}
          placeholder="Code or name, e.g. CS 3110"
          debounceMs={300}
        />
        <FilterSelect
          id="course-university"
          label="University"
          value={universityId || "all"}
          // Majors belong to one university, so changing it clears the major filter.
          onChange={(university) => list.set({ university, major: null })}
          options={[
            { value: "all", label: "All universities" },
            ...(universities.data?.data ?? []).map((u) => ({ value: u.id, label: u.name })),
          ]}
        />
        {universityId ? (
          <FilterSelect
            id="course-major"
            label="Major"
            value={majorId || "all"}
            onChange={(major) => list.set({ major })}
            options={[{ value: "all", label: "All majors" }, ...(majors.data ?? []).map((m) => ({ value: m.id, label: m.name }))]}
          />
        ) : null}
        <FilterSelect
          id="course-category"
          label="Category"
          value={category ?? "all"}
          onChange={(value) => list.set({ category: value })}
          options={[{ value: "all", label: "All categories" }, ...CATEGORY_ORDER.map((c) => ({ value: c, label: categoryLabel(c) }))]}
        />
        <FilterSelect
          id="course-source"
          label="Source"
          value={source ?? "all"}
          onChange={(value) => list.set({ source: value })}
          options={[{ value: "all", label: "All sources" }, ...SOURCES.map((s) => ({ value: s, label: COURSE_SOURCE_LABEL[s] }))]}
        />
      </TableToolbar>

      {courses.error ? (
        <QueryError error={courses.error} onRetry={() => courses.refetch()} title="We couldn't load courses" />
      ) : !meta ? (
        <Skeleton className="h-96 w-full rounded-lg" />
      ) : (
        <>
          <ResultCount shown={meta.total} total={meta.total} noun={meta.total === 1 ? "course" : "courses"} />
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(c) => c.id}
            caption="Courses"
            pagination={{ page: meta.page, pageSize: meta.pageSize, total: meta.total, onPageChange: (page) => list.set({ page }) }}
            busy={courses.isPlaceholderData}
            empty={list.hasFilters ? <EmptyResults onClear={list.clear} /> : <EmptyResults message="No courses yet." />}
            actions={(c) => (
              <RowActions
                name={`${c.code} ${c.name}`}
                onView={() => setViewing(c)}
                onEdit={() => setEditing(c)}
                onDelete={() => setDeleting(c)}
              />
            )}
          />
        </>
      )}

      <DetailSheet
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing?.name}
        description={viewing ? `${viewing.code} · ${viewing.university.name} · ${viewing.major.name}` : undefined}
        footer={
          viewing ? (
            <>
              <Button variant="outline" size="lg" onClick={() => setDeleting(viewing)} className="mr-auto text-destructive hover:text-destructive">
                Delete
              </Button>
              <Button size="lg" onClick={() => setEditing(viewing)}>
                Edit course
              </Button>
            </>
          ) : null
        }
      >
        {viewing ? (
          <>
            <DetailSection title="Description">
              <p className="text-sm leading-relaxed text-foreground">{viewing.description ?? "No description."}</p>
            </DetailSection>
            <DetailSection title="Details">
              <DetailList
                items={[
                  {
                    label: "Category",
                    value: <StatusBadge tone={CATEGORY_TONE[viewing.category]}>{categoryLabel(viewing.category)}</StatusBadge>,
                  },
                  { label: "Credit hours", value: viewing.credits },
                  { label: "Offered", value: offeredLabel(viewing.offeredTerms) },
                  { label: "Prerequisites", value: <CodeList codes={viewing.prerequisites.map((c) => c.code)} /> },
                  { label: "Corequisites", value: <CodeList codes={viewing.corequisites.map((c) => c.code)} /> },
                  {
                    label: "Last updated",
                    value: `${formatDate(viewing.updatedAt)}${viewing.updatedBy ? ` · ${viewing.updatedBy.name}` : ""}`,
                  },
                  { label: "Source", value: SOURCE_DESCRIPTION[viewing.source] },
                ]}
              />
            </DetailSection>
          </>
        ) : null}
      </DetailSheet>

      <FormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing === "new" ? "Add course" : "Edit course"}
        description="Requisite codes are checked against the selected major's courses."
      >
        {editing !== null ? (
          <CourseForm
            key={editing === "new" ? "new" : editing.id}
            course={editing === "new" ? undefined : editing}
            defaultUniversityId={universityId || undefined}
            defaultMajorId={majorId || undefined}
            onCancel={() => setEditing(null)}
            onSaved={(saved) => {
              const isNew = editing === "new"
              setEditing(null)
              if (viewing?.id === saved.id) setViewing(saved)
              toast({ tone: "success", title: isNew ? "Course added" : "Course updated", description: `${saved.code} ${saved.name}` })
            }}
          />
        ) : null}
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.code}?`}
        description={
          deleting ? (
            <p>
              {deleting.name} will be removed from {deleting.major.name} at {deleting.university.name}, and from the requisites
              of other courses. You can&rsquo;t undo this. Courses used in student records or plans can&rsquo;t be deleted.
            </p>
          ) : null
        }
        destructive
        confirmLabel="Delete course"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
