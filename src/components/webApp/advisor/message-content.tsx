import type { ReactNode } from "react"

/** Renders `**bold**` and `_italic_` spans inside a line of advisor text. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index} className="font-medium text-foreground">{part.slice(2, -2)}</strong>
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
}

/**
 * Minimal formatter for advisor replies: paragraphs plus "- " bullet lists.
 * Deliberately small (no HTML injection, no dependency); swap for a Markdown renderer if
 * a real model returns richer formatting.
 */
export function MessageContent({ content }: { content: string }) {
  const blocks: ReactNode[] = []
  let list: string[] = []

  const flushList = () => {
    if (list.length === 0) return
    const items = list
    blocks.push(
      <ul key={`list-${blocks.length}`} className="space-y-1.5 pl-1">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-highlight" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    )
    list = []
  }

  for (const line of content.split("\n")) {
    if (line.startsWith("- ")) {
      list.push(line.slice(2))
      continue
    }
    flushList()
    if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{inline(line)}</p>)
  }
  flushList()

  return <div className="space-y-3">{blocks}</div>
}
