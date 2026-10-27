export function CodeList({ codes }: { codes: string[] }) {
  return codes.length ? (
    <span className="font-mono text-xs text-muted-foreground">{codes.join(", ")}</span>
  ) : (
    <span className="text-xs text-muted-foreground">—</span>
  )
}
