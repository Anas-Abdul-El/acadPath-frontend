import { useState } from "react"
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

import { useAdminUniversity, useDeleteMajor } from "@/api/admin"
import type { AdminMajorDto } from "@/api/types"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { DetailList, DetailSection } from "@/components/admin/detail-sheet"
import { FormDialog } from "@/components/admin/form-dialog"
import { StatusBadge } from "@/components/admin/status-badge"
import { MajorForm } from "@/components/admin/university/major-form"
import { PageLoader, QueryError } from "@/components/shared/query-state"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/admin/format"
import { CATALOG_STATUS_TONE, PROCESSING_STATUS_TONE } from "@/lib/admin/tones"
import { pluralize } from "@/lib/files/format"
import { CATALOG_STATUS_LABEL, DEGREE_LABEL, PROCESSING_STATUS_LABEL } from "@/lib/labels"
import { ROUTES } from "@/lib/routes"
import { useToast } from "@/hooks/use-toast"

export function UniversityDetails({ universityId }: { universityId: string }) {
  const { data: university, error, refetch } = useAdminUniversity(universityId)
  const deleteMajor = useDeleteMajor()
  const toast = useToast()
  const [editingMajor, setEditingMajor] = useState<AdminMajorDto | "new" | null>(null)
  const [deletingMajor, setDeletingMajor] = useState<AdminMajorDto | null>(null)

  if (error) return <QueryError error={error} onRetry={() => refetch()} />
  if (!university) return <PageLoader className="min-h-48" />

  const confirmDeleteMajor = () => {
    const major = deletingMajor
    if (!major) return
    setDeletingMajor(null)
    deleteMajor.mutate(major.id, {
      onSuccess: () => toast({ tone: "success", title: "Major deleted", description: `${major.name} and its courses were removed.` }),
    })
  }

  return (
    <>
      <DetailSection title="Overview">
        <DetailList
          items={[
            {
              label: "Catalog",
              value: (
                <StatusBadge tone={CATALOG_STATUS_TONE[university.catalogStatus]}>
                  {CATALOG_STATUS_LABEL[university.catalogStatus]}
                </StatusBadge>
              ),
            },
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
            { label: "Students", value: university.studentCount },
            {
              label: "Courses",
              value: university.courseCount ? (
                <Link to={`${ROUTES.admin.courses}?university=${university.id}`} className="text-primary hover:underline">
                  {pluralize(university.courseCount, "course")}
                </Link>
              ) : (
                "None yet"
              ),
            },
            { label: "Added", value: formatDate(university.createdAt) },
          ]}
        />
      </DetailSection>

      <DetailSection
        title={`Majors (${university.majors.length})`}
        action={
          <Button variant="ghost" size="sm" onClick={() => setEditingMajor("new")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Add major
          </Button>
        }
      >
        {university.majors.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {university.majors.map((major) => (
              <li key={major.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{major.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DEGREE_LABEL[major.degreeType]}
                    {major.totalRequiredCredits ? ` · ${major.totalRequiredCredits} credits` : ""} ·{" "}
                    {pluralize(major.courseCount, "course")} · {pluralize(major.studentCount, "student")}
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditingMajor(major)} aria-label={`Edit ${major.name}`} title="Edit">
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeletingMajor(major)}
                  aria-label={`Delete ${major.name}`}
                  title="Delete"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            No majors yet. Courses are attached to a major, so add one before adding courses.
          </p>
        )}
      </DetailSection>

      <DetailSection title={`Catalog sources (${university.sources.length})`}>
        {university.sources.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {university.sources.map((source) => (
              <li key={source.id} className="px-4 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-foreground" title={source.title}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                  </p>
                  <StatusBadge tone={PROCESSING_STATUS_TONE[source.status]}>{PROCESSING_STATUS_LABEL[source.status]}</StatusBadge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {source.sourceType} · added {formatDate(source.createdAt)}
                  {source.lastProcessedAt ? ` · processed ${formatDate(source.lastProcessedAt)}` : ""}
                </p>
                {source.errorMessage ? <p className="mt-1 text-xs text-destructive">{source.errorMessage}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            No catalog sources yet. They appear when the AI finds a catalog or a student uploads one.
          </p>
        )}
      </DetailSection>

      <FormDialog
        open={editingMajor !== null}
        onOpenChange={(open) => !open && setEditingMajor(null)}
        title={editingMajor === "new" ? "Add major" : "Edit major"}
        description={`A degree program at ${university.name}. Courses are attached to a major.`}
      >
        {editingMajor !== null ? (
          <MajorForm
            key={editingMajor === "new" ? "new" : editingMajor.id}
            universityId={university.id}
            major={editingMajor === "new" ? undefined : editingMajor}
            onCancel={() => setEditingMajor(null)}
            onSaved={(major) => {
              setEditingMajor(null)
              toast({ tone: "success", title: editingMajor === "new" ? "Major added" : "Major updated", description: major.name })
            }}
          />
        ) : null}
      </FormDialog>

      <ConfirmDialog
        open={deletingMajor !== null}
        onOpenChange={(open) => !open && setDeletingMajor(null)}
        title={`Delete ${deletingMajor?.name}?`}
        description={
          deletingMajor ? (
            <p>
              This also deletes its {pluralize(deletingMajor.courseCount, "course")}. Students in this major lose it from their
              profile, and study plans that use its courses are deleted. You can&rsquo;t undo this.
            </p>
          ) : null
        }
        destructive
        confirmLabel="Delete major"
        onConfirm={confirmDeleteMajor}
      />
    </>
  )
}
