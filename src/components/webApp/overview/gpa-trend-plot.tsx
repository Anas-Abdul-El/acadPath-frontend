import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts"

import type { TermGpa } from "@/mock/student-preview"

const DEANS_LIST_GPA = 3.5

function GpaTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as TermGpa

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{point.term}</p>
      <p className="mt-1 text-muted-foreground">
        Term GPA{" "}
        <span className="font-mono text-foreground font-tabular">{point.gpa.toFixed(2)}</span>
        <span className="mx-1.5 text-border">·</span>
        {point.credits} credits
      </p>
    </div>
  )
}

/** Recharts plot for the term GPA card. Loaded lazily to keep Recharts out of the main bundle. */
export default function GpaTrendPlot({ data }: { data: TermGpa[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
        accessibilityLayer={false}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
        <XAxis
          dataKey="shortTerm"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          domain={[3, 4]}
          ticks={[3, 3.5, 4]}
          tickFormatter={(value: number) => value.toFixed(1)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <ReferenceLine
          y={DEANS_LIST_GPA}
          stroke="var(--highlight)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: "Dean’s List",
            position: "insideTopLeft",
            fill: "var(--muted-foreground)",
            fontSize: 10,
            dy: -14,
            dx: 4,
          }}
        />
        <Tooltip
          content={GpaTooltip}
          cursor={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.35 }}
        />
        <Line
          type="monotone"
          dataKey="gpa"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
