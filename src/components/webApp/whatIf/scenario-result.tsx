import { ArrowRight, CircleMinus, CirclePlus, FlaskConical, MoveRight, RotateCcw, TriangleAlert } from "lucide-react"

import { DashboardCard } from "@/components/shared/dashboard-card"
import { ImpactTile } from "@/components/webApp/whatIf/impact-tile"
import type { PlanChange, ScenarioAnalysis, SemesterLoad } from "@/types/what-if"
import { cn } from "@/lib/utils"

const signed = (value: number, digits = 0) =>
  `${value > 0 ? "+" : value < 0 ? "−" : "±"}${Math.abs(value).toFixed(digits)}`

const CHANGE = {
  added: { icon: CirclePlus, label: "Added", className: "text-success" },
  removed: { icon: CircleMinus, label: "Removed", className: "text-destructive" },
  moved: { icon: MoveRight, label: "Moved", className: "text-warning" },
  retake: { icon: RotateCcw, label: "Retake", className: "text-primary" },
} satisfies Record<PlanChange["kind"], unknown>

export function ScenarioResult({ analysis }: { analysis: ScenarioAnalysis }) {
  const gpaDelta = analysis.gpa.scenario - analysis.gpa.current
  const creditDelta = analysis.credits.scenario - analysis.credits.current
  const semesterDelta = analysis.graduation.semestersDelta

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-md border border-dashed border-highlight/70 bg-highlight/10 px-3.5 py-2.5 text-xs leading-relaxed text-highlight-foreground">
        <FlaskConical aria-hidden="true" className="mt-px size-3.5 shrink-0" />
        <span>
          <span className="font-medium">Simulated estimate.</span> Produced by rule-based sample logic from your record and
          the catalog — not an AI calculation, and not an official degree audit.
        </span>
      </p>

      <div>
        <h2 className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">{analysis.headline}</h2>
        <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-muted-foreground">{analysis.summary}</p>
      </div>

      <section
        aria-label="Estimated impact"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3"
      >
        <ImpactTile
          label="GPA impact"
          current={analysis.gpa.current.toFixed(2)}
          scenario={analysis.gpa.scenario.toFixed(2)}
          delta={Math.abs(gpaDelta) < 0.005 ? "No change" : signed(gpaDelta, 2)}
          effect={Math.abs(gpaDelta) < 0.005 ? "neutral" : gpaDelta > 0 ? "better" : "worse"}
          footnote={analysis.gpa.label}
        />
        <ImpactTile
          label="Credit impact"
          current={analysis.credits.current}
          scenario={analysis.credits.scenario}
          delta={creditDelta === 0 ? "No change" : `${signed(creditDelta)} credits`}
          effect={creditDelta === 0 ? "neutral" : creditDelta > 0 ? "better" : "worse"}
          footnote={analysis.credits.label}
        />
        <ImpactTile
          label="Graduation timeline"
          current={analysis.graduation.current.replace("December", "Dec")}
          scenario={analysis.graduation.scenario.replace("December", "Dec")}
          delta={
            semesterDelta === 0
              ? "On schedule"
              : `${signed(semesterDelta)} ${Math.abs(semesterDelta) === 1 ? "semester" : "semesters"}`
          }
          effect={semesterDelta === 0 ? "neutral" : semesterDelta < 0 ? "better" : "worse"}
          footnote="Expected graduation"
        />
      </section>

      {analysis.warnings.length > 0 ? (
        <ul className="space-y-2">
          {analysis.warnings.map((warning) => (
            <li
              key={warning}
              className="flex gap-2.5 rounded-md border border-warning/30 bg-warning/10 px-3.5 py-2.5 text-sm text-[color-mix(in_oklch,var(--warning),var(--foreground)_35%)]"
            >
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <DashboardCard
          title="Changes to your plan"
          subtitle={analysis.planChanges.length ? `${analysis.planChanges.length} course changes` : "No changes"}
          className="lg:col-span-2"
        >
          {analysis.planChanges.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your semester plan stays exactly the same.</p>
          ) : (
            <ul className="-my-1 divide-y divide-border/70">
              {analysis.planChanges.map((change) => {
                const { icon: Icon, label, className } = CHANGE[change.kind]
                return (
                  <li key={`${change.kind}-${change.code}`} className="flex gap-3 py-2.5">
                    <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", className)} />
                    <div className="min-w-0 text-[13px]">
                      <p className="text-foreground">
                        <span className="sr-only">{label}: </span>
                        <span className="font-mono text-xs">{change.code}</span> {change.title}
                      </p>
                      <p className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        {change.kind === "moved" ? (
                          <>
                            {change.from} <ArrowRight aria-label="to" className="size-3" /> {change.to}
                          </>
                        ) : change.kind === "removed" ? (
                          <>Removed from {change.from}</>
                        ) : change.kind === "retake" ? (
                          <>Retake in {change.to}</>
                        ) : (
                          <>Added to {change.to}</>
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Current plan vs. scenario" subtitle="Remaining semesters" className="lg:col-span-3">
          <PlanComparison current={analysis.semesters.current} scenario={analysis.semesters.scenario} />
        </DashboardCard>
      </div>

      <DashboardCard title="Side-by-side comparison" subtitle="Simulated estimates">
        <div className="relative -mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <caption className="sr-only">Current plan compared with the scenario</caption>
            <thead>
              <tr className="border-y border-border text-[11px] tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="py-2 pr-3 pl-4 font-medium sm:pl-5">Measure</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Current plan</th>
                <th scope="col" className="py-2 pr-4 pl-3 text-right font-medium sm:pr-5">Scenario</th>
              </tr>
            </thead>
            <tbody>
              {analysis.comparison.map((row) => (
                <tr key={row.label} className="border-b border-border/70 last:border-b-0">
                  <th scope="row" className="py-2.5 pr-3 pl-4 text-[13px] font-normal text-foreground sm:pl-5">
                    {row.label}
                  </th>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground font-tabular">{row.current}</td>
                  <td
                    className={cn(
                      "py-2.5 pr-4 pl-3 text-right font-mono text-xs font-tabular sm:pr-5",
                      row.effect === "better" && "font-medium text-success",
                      row.effect === "worse" && "font-medium text-destructive",
                      row.effect === "neutral" && "text-foreground",
                    )}
                  >
                    {row.scenario}
                    {row.effect !== "neutral" ? <span className="sr-only"> ({row.effect})</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      <details className="group rounded-lg border border-border bg-card px-4 py-3 sm:px-5">
        <summary className="cursor-pointer text-sm font-medium text-foreground">Assumptions behind this estimate</summary>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {analysis.assumptions.map((assumption) => (
            <li key={assumption} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-highlight" />
              {assumption}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

function PlanComparison({ current, scenario }: { current: SemesterLoad[]; scenario: SemesterLoad[] }) {
  const labels = [...new Set([...current, ...scenario].map((s) => s.label))]
  const find = (plan: SemesterLoad[], label: string) => plan.find((s) => s.label === label)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[6.5rem_1fr_1fr] gap-3 text-[11px] tracking-wide text-muted-foreground uppercase">
        <span>Semester</span>
        <span>Current</span>
        <span>Scenario</span>
      </div>
      {labels.map((label) => {
        const before = find(current, label)
        const after = find(scenario, label)
        return (
          <div key={label} className="grid grid-cols-[6.5rem_1fr_1fr] gap-3 border-t border-border/70 pt-3">
            <p className="text-[13px] font-medium text-foreground">{label}</p>
            <SemesterCell load={before} compareTo={after} />
            <SemesterCell load={after} compareTo={before} highlight />
          </div>
        )
      })}
    </div>
  )
}

function SemesterCell({ load, compareTo, highlight = false }: { load?: SemesterLoad; compareTo?: SemesterLoad; highlight?: boolean }) {
  if (!load || load.courses.length === 0) return <p className="text-xs text-muted-foreground">—</p>
  return (
    <div className="min-w-0">
      <p className="font-mono text-[11px] text-muted-foreground">{load.credits} cr</p>
      <ul className="mt-1 flex flex-wrap gap-1">
        {load.courses.map((code) => {
          const changed = highlight && !compareTo?.courses.includes(code)
          return (
            <li
              key={code}
              className={cn(
                "rounded border px-1.5 py-px font-mono text-[11px]",
                changed ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-foreground",
              )}
            >
              {code}
              {changed ? <span className="sr-only"> (changed)</span> : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
