import { useState } from "react"
import { Plus, Sparkles } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { CodeList } from "@/components/admin/courses/code-list"
import { CourseForm } from "@/components/admin/courses/course-form"
import { DataTable, type Column } from "@/components/admin/data-table"
import { DetailList, DetailSection, DetailSheet } from "@/components/admin/detail-sheet"
import { FormDialog } from "@/components/admin/form-dialog"
import { RowActions } from "@/components/admin/row-actions"
import { StatusBadge, type BadgeTone } from "@/components/admin/status-badge"
import { EmptyResults, FilterSelect, ResultCount, SearchField, TableToolbar } from "@/components/admin/table-parts"
import { AppPageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { COURSE_CATEGORIES, type CourseCategory } from "@/mock/academic/course-catalog"
import type { AdminCourse } from "@/mock/admin/courses"
import { courseDeleted, courseSaved, CURRENT_ADMIN, selectAdminData } from "@/store/slices/admin/admin-slice"
import { formatDate, formatRelative } from "@/lib/admin/format"
import { universityById } from "@/lib/admin/selectors"
import { normalizeCode, parseCodeList, type CourseFormValues } from "@/schemas/admin"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const CATEGORY_TONE: Record<CourseCategory, BadgeTone> = {
  "major-requirement": "info",
  "major-elective": "highlight",
  "math-science": "neutral",
  "general-education": "neutral",
}

const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")

export function CoursesAdminPage() {
  const state = useAppSelector(selectAdminData)
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [params] = useSearchParams()
  const universities = universityById(state)
  const [query, setQuery] = useState("")
  const [universityId, setUniversityId] = useState(() => {
    const fromUrl = params.get("university")
    return fromUrl && universities.has(fromUrl) ? fromUrl : "all"
  })
  const [category, setCategory] = useState<CourseCategory | "all">("all")
  const [source, setSource] = useState<"all" | "ai" | "other">("all")
  const [viewing, setViewing] = useState<AdminCourse | null>(null)
  const [editing, setEditing] = useState<AdminCourse | "new" | null>(null)
  const [deleting, setDeleting] = useState<AdminCourse | null>(null)

  const universitiesWithCourses = state.universities
    .filter((u) => state.courses.some((c) => c.universityId === u.id) || u.id === universityId)
    .sort((a, b) => a.name.localeCompare(b.name))

  const rows = state.courses.filter((course) => {
    const q = query.trim().toLowerCase()
    const matches = !q || compact(course.code).includes(compact(q)) || course.title.toLowerCase().includes(q)
    const sourceMatch = source === "all" || (source === "ai") === Boolean(course.capturedByAi)
    return (
      matches &&
      sourceMatch &&
      (universityId === "all" || course.universityId === universityId) &&
      (category === "all" || course.category === category)
    )
  })

  const clearFilters = () => {
    setQuery("")
    setUniversityId("all")
    setCategory("all")
    setSource("all")
  }

  const dependentsOf = (course: AdminCourse) =>
    state.courses.filter(
      (c) => c.universityId === course.universityId && (c.prerequisites.includes(course.code) || c.corequisites.includes(course.code)),
    )

  const save = (values: CourseFormValues) => {
    const existing = editing !== "new" ? editing : null
    const code = normalizeCode(values.code)
    const course: AdminCourse = {
      id: existing?.id ?? `${values.universityId}-${code.replace(/\s+/g, "-").toLowerCase()}-${crypto.randomUUID().slice(0, 4)}`,
      universityId: values.universityId,
      code,
      title: values.title.trim(),
      description: values.description.trim(),
      credits: values.credits,
      category: values.category,
      prerequisites: parseCodeList(values.prerequisites),
      corequisites: parseCodeList(values.corequisites),
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: CURRENT_ADMIN,
    }
    dispatch(courseSaved(course))
    if (viewing?.id === course.id) setViewing(course)
    setEditing(null)
    toast({
      tone: "success",
      title: existing ? "Course updated" : "Course added",
      description: `${code} ${course.title} · sample data only, resets on refresh.`,
    })
  }

  const confirmDelete = () => {
    if (!deleting) return
    dispatch(courseDeleted(deleting.id))
    if (viewing?.id === deleting.id) setViewing(null)
    toast({ tone: "success", title: "Course deleted", description: `${deleting.code} ${deleting.title} was removed.` })
    setDeleting(null)
  }

  const columns: Column<AdminCourse>[] = [
    {
      id: "code",
      header: "Code",
      sortValue: (c) => c.code,
      cell: (c) => <span className="font-mono text-xs whitespace-nowrap text-foreground">{c.code}</span>,
    },
    {
      id: "title",
      header: "Course",
      sortValue: (c) => c.title,
      className: "min-w-56",
      cell: (c) => (
        <button type="button" onClick={() => setViewing(c)} className="max-w-xs text-left">
          <span className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-foreground hover:text-primary hover:underline">{c.title}</span>
            {c.capturedByAi ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-highlight/60 bg-highlight/15 px-1 font-mono text-[10px] text-highlight-foreground">
                <Sparkles aria-hidden="true" className="size-2.5" />
                AI<span className="sr-only">-captured</span>
              </span>
            ) : null}
          </span>
          <span className="line-clamp-1 text-xs text-muted-foreground">{c.description}</span>
        </button>
      ),
    },
    {
      id: "university",
      header: "University",
      hideBelow: "md",
      sortValue: (c) => universities.get(c.universityId)?.name ?? "",
      cell: (c) => {
        const university = universities.get(c.universityId)
        return <span className="text-[13px] text-muted-foreground" title={university?.name}>{university?.shortName ?? university?.name}</span>
      },
    },
    {
      id: "category",
      header: "Category",
      hideBelow: "lg",
      sortValue: (c) => COURSE_CATEGORIES[c.category].label,
      cell: (c) => <StatusBadge tone={CATEGORY_TONE[c.category]}>{COURSE_CATEGORIES[c.category].label}</StatusBadge>,
    },
    {
      id: "credits",
      header: "Cr",
      align: "right",
      sortValue: (c) => c.credits,
      cell: (c) => <span className="font-mono text-xs text-foreground font-tabular">{c.credits}</span>,
    },
    { id: "prereqs", header: "Prerequisites", hideBelow: "lg", cell: (c) => <CodeList codes={c.prerequisites} /> },
    {
      id: "updated",
      header: "Updated",
      hideBelow: "sm",
      sortValue: (c) => c.updatedAt,
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
        <SearchField id="course-search" label="Search" value={query} onChange={setQuery} placeholder="Code or name, e.g. CS 3110" />
        <FilterSelect
          id="course-university"
          label="University"
          value={universityId}
          onChange={setUniversityId}
          options={[{ value: "all", label: "All universities" }, ...universitiesWithCourses.map((u) => ({ value: u.id, label: u.name }))]}
        />
        <FilterSelect
          id="course-source"
          label="Source"
          value={source}
          onChange={setSource}
          options={[
            { value: "all" as const, label: "All sources" },
            { value: "ai" as const, label: "Captured by AI" },
            { value: "other" as const, label: "Catalog or admin" },
          ]}
        />
        <FilterSelect
          id="course-category"
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all" as const, label: "All categories" },
            ...(Object.keys(COURSE_CATEGORIES) as CourseCategory[]).map((c) => ({ value: c, label: COURSE_CATEGORIES[c].label })),
          ]}
        />
      </TableToolbar>

      <ResultCount shown={rows.length} total={state.courses.length} noun="courses" />

      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(c) => c.id}
        caption="Courses"
        initialSort={{ id: "updated", direction: "desc" }}
        pageSize={12}
        empty={<EmptyResults onClear={clearFilters} />}
        actions={(c) => (
          <RowActions name={`${c.code} ${c.title}`} onView={() => setViewing(c)} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
        )}
      />

      <DetailSheet
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        title={viewing?.title}
        description={viewing ? `${viewing.code} · ${universities.get(viewing.universityId)?.name}` : undefined}
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
              <p className="text-sm leading-relaxed text-foreground">{viewing.description}</p>
            </DetailSection>
            <DetailSection title="Details">
              <DetailList
                items={[
                  { label: "Category", value: <StatusBadge tone={CATEGORY_TONE[viewing.category]}>{COURSE_CATEGORIES[viewing.category].label}</StatusBadge> },
                  { label: "Credit hours", value: viewing.credits },
                  { label: "Prerequisites", value: <CodeList codes={viewing.prerequisites} /> },
                  { label: "Corequisites", value: <CodeList codes={viewing.corequisites} /> },
                  { label: "Required by", value: <CodeList codes={dependentsOf(viewing).map((c) => c.code)} /> },
                  { label: "Last updated", value: `${formatDate(viewing.updatedAt)} · ${viewing.updatedBy}` },
                  {
                    label: "Source",
                    value: viewing.capturedByAi ? (
                      "Captured by AI from student-uploaded documents"
                    ) : viewing.updatedBy === "Catalog import" ? (
                      "Official catalog import"
                    ) : (
                      "Added by an admin"
                    ),
                  },
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
        description="Codes are checked against the selected university's courses."
      >
        {editing !== null ? (
          <CourseForm
            key={editing === "new" ? "new" : editing.id}
            course={editing === "new" ? undefined : editing}
            defaultUniversityId={universityId !== "all" ? universityId : undefined}
            universities={state.universities}
            courses={state.courses}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </FormDialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.code}?`}
        description={
          deleting ? (
            <>
              <p>
                {deleting.title} will be removed from {universities.get(deleting.universityId)?.name}. You can't undo this.
              </p>
              {dependentsOf(deleting).length ? (
                <p className="mt-2">
                  It's also removed as a requisite from {dependentsOf(deleting).map((c) => c.code).join(", ")}.
                </p>
              ) : null}
            </>
          ) : null
        }
        destructive
        confirmLabel="Delete course"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
