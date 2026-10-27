/** Fixed "today" for the sample data, so relative dates read sensibly in the prototype. */
export const MOCK_NOW = new Date("2026-10-16T12:00:00")

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" })
const shortDateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })
const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" })

const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)

export const formatDate = (iso: string) => dateFormat.format(parse(iso))
export const formatShortDate = (iso: string) => shortDateFormat.format(parse(iso))
export const formatDateTime = (iso: string) => `${dateFormat.format(parse(iso))}, ${timeFormat.format(parse(iso))}`

/** "Today", "Yesterday", "3 days ago", or a date for anything older than a week. */
export function formatRelative(iso: string) {
  const days = Math.floor((MOCK_NOW.getTime() - parse(iso).getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return formatDate(iso)
}

/** ISO timestamp for "now" in this prototype. */
export const nowIso = () => new Date().toISOString().slice(0, 19)
