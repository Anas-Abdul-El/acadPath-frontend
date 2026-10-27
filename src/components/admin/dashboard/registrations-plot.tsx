import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, type TooltipContentProps, XAxis, YAxis } from "recharts"

type Point = { month: string; count: number }

function RegistrationsTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as Point
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{point.month} 2026</p>
      <p className="mt-1 text-muted-foreground">
        <span className="font-mono text-foreground font-tabular">{point.count}</span> new students
      </p>
    </div>
  )
}

/** Monthly registrations bar chart. Loaded lazily to keep Recharts out of the main bundle. */
export default function RegistrationsPlot({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} accessibilityLayer={false}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <Tooltip content={RegistrationsTooltip} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
