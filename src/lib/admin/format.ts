const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" })
const shortDateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })
const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" })

const parse = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)

export const formatDate = (iso: string) => dateFormat.format(parse(iso))
export const formatShortDate = (iso: string) => shortDateFormat.format(parse(iso))
export const formatDateTime = (iso: string) => `${dateFormat.format(parse(iso))}, ${timeFormat.format(parse(iso))}`

/** "Today", "Yesterday", "3 days ago", or a date for anything older than a week. */
export function formatRelative(iso: string) {
  const days = Math.floor((Date.now() - parse(iso).getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return formatDate(iso)
}
