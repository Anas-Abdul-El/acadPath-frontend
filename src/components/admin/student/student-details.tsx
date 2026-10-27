import { Lock } from "lucide-react"

import { DetailList, DetailSection } from "@/components/admin/detail-sheet"
import { Progress } from "@/components/ui/progress"
import type { AdminStudent } from "@/mock/admin/students"
import { selectAdminData } from "@/store/slices/admin/admin-slice"
import { formatDate, formatRelative } from "@/lib/admin/format"
import { universityById } from "@/lib/admin/selectors"
import { pluralize } from "@/lib/files/format"
import { useAppSelector } from "@/store/hooks"

export function StudentDetails({ student }: { student: AdminStudent }) {
  const state = useAppSelector(selectAdminData)
  const university = universityById(state).get(student.universityId)
  const academic = student.academic
  const percent = academic ? Math.round((academic.creditsCompleted / academic.creditsRequired) * 100) : 0

  return (
    <>
      <DetailSection title="Profile">
        <DetailList
          items={[
            { label: "University", value: university ? `${university.name} · ${university.city}` : "—" },
            { label: "Program", value: student.program },
            { label: "Registered", value: formatDate(student.registeredAt) },
            { label: "Last active", value: formatRelative(student.lastActiveAt) },
          ]}
        />
      </DetailSection>

      <DetailSection title="Academic summary">
        {academic ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">GPA</p>
                <p className="mt-1 font-display text-2xl leading-none text-foreground font-tabular">{academic.gpa.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="mt-1 font-display text-2xl leading-none text-foreground font-tabular">
                  {academic.creditsCompleted}
                  <span className="ml-1 font-sans text-xs text-muted-foreground">/ {academic.creditsRequired}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Graduation</p>
                <p className="mt-1.5 text-sm text-foreground">{academic.expectedGraduation}</p>
              </div>
            </div>
            <Progress value={percent} aria-label={`${percent}% of degree credits completed`} className="mt-4 h-1.5 bg-secondary" />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            No academic records yet. A summary appears once the student's transcript is processed.
          </p>
        )}
      </DetailSection>

      <DetailSection title="Documents">
        <DetailList
          items={[
            { label: "Transcripts", value: pluralize(student.documents.transcripts, "file") },
          ]}
        />
        <p className="mt-2 flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <Lock aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          Transcript contents and grades by course are private to the student and aren't shown here.
        </p>
      </DetailSection>

    </>
  )
}
