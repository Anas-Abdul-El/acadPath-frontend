import { Lock } from "lucide-react"

import { useAdminStudent } from "@/api/admin"
import type { AdminStudentDto } from "@/api/types"
import { DetailList, DetailSection } from "@/components/admin/detail-sheet"
import { StatusBadge } from "@/components/admin/status-badge"
import { PageLoader, QueryError } from "@/components/shared/query-state"
import { Progress } from "@/components/ui/progress"
import { academicYearLabel } from "@/data/academic-years"
import { formatDate, formatRelative } from "@/lib/admin/format"
import { PROCESSING_STATUS_TONE, STAGE } from "@/lib/admin/tones"
import { DOCUMENT_TYPE_LABEL, formatGpa, graduationLabel, majorLabel, PROCESSING_STATUS_LABEL } from "@/lib/labels"

/** Profile-level details only: the admin API never returns transcript contents or per-course grades. */
export function StudentDetails({ student }: { student: AdminStudentDto }) {
  const detail = useAdminStudent(student.id)
  const academic = student.academic
  const percent =
    academic && academic.creditsRequired
      ? Math.min(100, Math.round((academic.creditsCompleted / academic.creditsRequired) * 100))
      : null
  const stage = STAGE[student.stage]

  return (
    <>
      <DetailSection title="Profile">
        <DetailList
          items={[
            { label: "University", value: student.university?.name ?? "—" },
            { label: "Major", value: student.major ? majorLabel(student.major) : "—" },
            { label: "Year", value: student.yearOfStudy ? academicYearLabel(student.yearOfStudy) : "—" },
            { label: "Registered", value: formatDate(student.registeredAt) },
            { label: "Last active", value: student.lastActiveAt ? formatRelative(student.lastActiveAt) : "Never" },
            {
              label: "Onboarding",
              value: detail.data
                ? detail.data.onboardingCompletedAt
                  ? `Completed ${formatDate(detail.data.onboardingCompletedAt)}`
                  : "Not finished"
                : "…",
            },
          ]}
        />
      </DetailSection>

      <DetailSection title="Academic summary">
        {academic ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">GPA</p>
                <p className="mt-1 font-display text-2xl leading-none text-foreground font-tabular">{formatGpa(academic.gpa)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="mt-1 font-display text-2xl leading-none text-foreground font-tabular">
                  {academic.creditsCompleted}
                  {academic.creditsRequired ? (
                    <span className="ml-1 font-sans text-xs text-muted-foreground">/ {academic.creditsRequired}</span>
                  ) : null}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Graduation</p>
                <p className="mt-1.5 text-sm text-foreground">
                  {academic.expectedGraduation ? graduationLabel(academic.expectedGraduation) : "No plan yet"}
                </p>
              </div>
            </div>
            {percent !== null ? (
              <Progress value={percent} aria-label={`${percent}% of degree credits completed`} className="mt-4 h-1.5 bg-secondary" />
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            {stage.description}. A summary appears once the student&rsquo;s transcript is processed.
          </p>
        )}
      </DetailSection>

      <DetailSection title="Documents">
        {detail.error ? (
          <QueryError error={detail.error} onRetry={() => detail.refetch()} />
        ) : !detail.data ? (
          <PageLoader className="min-h-24" />
        ) : detail.data.documentsList.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {detail.data.documentsList.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-foreground" title={document.fileName}>
                    {document.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_TYPE_LABEL[document.type]} · {formatDate(document.createdAt)}
                  </p>
                </div>
                <StatusBadge tone={PROCESSING_STATUS_TONE[document.status]}>{PROCESSING_STATUS_LABEL[document.status]}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">No documents uploaded.</p>
        )}
        <p className="mt-2 flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <Lock aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          Transcript contents and grades by course are private to the student and aren&rsquo;t shown here.
        </p>
      </DetailSection>
    </>
  )
}
