import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react"
import { Loader2 } from "lucide-react"

import type { PortalBrowser } from "@/hooks/use-portal-browser"
import { cn } from "@/lib/utils"

// Keys forwarded as key presses; printable characters are sent as text.
const SPECIAL_KEYS = new Set([
  "Enter", "Backspace", "Tab", "Escape", "Delete",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End",
])

type PortalScreenProps = {
  browser: PortalBrowser
  /** Shown over the screen, e.g. while the transcript is being imported. */
  overlay?: string | null
  className?: string
}

/**
 * The live view of the remote browser. It draws the frames streamed from the server
 * and sends clicks, scrolling, typing and pastes back. The remote page is resized to
 * match this element, so one screen pixel is one page pixel.
 */
export function PortalScreen({ browser, overlay, className }: PortalScreenProps) {
  const { imageRef, hasFrame, send, resize, phase } = browser
  const containerRef = useRef<HTMLDivElement>(null)

  // Tell the server our size (debounced), so the portal page fills the view.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let timer: number | undefined
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      window.clearTimeout(timer)
      const { width, height } = entry.contentRect
      timer = window.setTimeout(() => resize(width, height), 150)
    })
    observer.observe(container)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [resize])

  // React's onWheel is passive, so it can't stop the page itself from scrolling.
  useEffect(() => {
    const image = imageRef.current
    if (!image) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      send({ type: "scroll", deltaY: event.deltaY })
    }
    image.addEventListener("wheel", onWheel, { passive: false })
    return () => image.removeEventListener("wheel", onWheel)
  }, [imageRef, send])

  // Map a click on the scaled image to the remote page's coordinates.
  const onClick = (event: MouseEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    if (!image.naturalWidth) return
    image.focus()
    const rect = image.getBoundingClientRect()
    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
    const offsetX = (rect.width - image.naturalWidth * scale) / 2
    const offsetY = (rect.height - image.naturalHeight * scale) / 2
    const x = Math.round((event.clientX - rect.left - offsetX) / scale)
    const y = Math.round((event.clientY - rect.top - offsetY) / scale)
    if (x >= 0 && y >= 0 && x <= image.naturalWidth && y <= image.naturalHeight) send({ type: "click", x, y })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLImageElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return // let Ctrl+V reach onPaste
    if (SPECIAL_KEYS.has(event.key)) {
      event.preventDefault()
      send({ type: "key", key: event.key })
    } else if (event.key.length === 1) {
      event.preventDefault()
      send({ type: "text", text: event.key })
    }
  }

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData("text").slice(0, 500)
    if (!text) return
    event.preventDefault()
    send({ type: "text", text })
  }

  const waiting = !hasFrame
  const waitingLabel = phase === "reconnecting" ? "Reconnecting…" : "Opening your student portal…"

  return (
    <div
      ref={containerRef}
      onPaste={onPaste}
      className={cn("relative overflow-hidden bg-muted", className)}
    >
      <img
        ref={imageRef}
        alt="Your university's student portal, running in a secure remote browser"
        tabIndex={0}
        draggable={false}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(
          "block size-full cursor-pointer object-contain outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          waiting && "invisible",
        )}
      />
      {waiting || overlay ? (
        <div
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 text-sm text-muted-foreground backdrop-blur-[2px]"
        >
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          <span>{overlay ?? waitingLabel}</span>
        </div>
      ) : null}
    </div>
  )
}
