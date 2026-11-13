import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  Globe,
  KeyRound,
  Lock,
  Maximize2,
  Minimize2,
  RotateCw,
  Square,
} from "lucide-react"

import { errorMessage } from "@/api/errors"
import { useImportPortalTranscript } from "@/api/portal"
import { FormAlert } from "@/components/shared/form-alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePortalBrowser } from "@/hooks/use-portal-browser"
import { cn } from "@/lib/utils"
import { PortalScreen } from "./portal-screen"

const STEPS = [
  { icon: KeyRound, title: "Sign in", description: "Use your usual student ID and password, typed straight into your university's portal." },
  { icon: FileSearch, title: "Open your transcript", description: "Go to your grades or transcript page. AcadPath detects it on its own." },
  { icon: CheckCircle2, title: "Import", description: "We read the page and pull out your courses, grades and terms." },
]

type PortalConnectProps = {
  universityName: string
  /** The student already has a transcript on file. */
  alreadyImported: boolean
  disabled?: boolean
  onImported?: () => void
}

/**
 * Imports the transcript from the student's university portal: opens a secure remote
 * browser, lets the student sign in and open their transcript, then sends the page to
 * the AI to extract the course records.
 */
export function PortalConnect({ universityName, alreadyImported, disabled, onImported }: PortalConnectProps) {
  const browser = usePortalBrowser()
  const importTranscript = useImportPortalTranscript()
  const [expandedChoice, setExpanded] = useState(false)
  const [importedNow, setImportedNow] = useState(false)

  const { phase, status } = browser
  const open = phase === "starting" || phase === "live" || phase === "reconnecting"
  const importing = importTranscript.isPending
  const expanded = expandedChoice && open

  // Esc leaves the expanded view (unless the remote screen has focus: Esc goes to the portal there).
  useEffect(() => {
    if (!expanded) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && document.activeElement !== browser.imageRef.current) setExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded, browser.imageRef])

  const runImport = async () => {
    try {
      await importTranscript.mutateAsync()
      browser.finish()
      setImportedNow(true)
      onImported?.()
    } catch {
      // Shown below from importTranscript.error; the browser stays open to try again.
    }
  }

  const openPortal = () => {
    importTranscript.reset()
    setImportedNow(false)
    browser.start()
  }

  // ── Done ──
  if (!open && (importedNow || alreadyImported)) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3 text-sm leading-relaxed">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-foreground">
              {importedNow ? "Transcript imported from your portal" : "Your transcript is on file"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {importedNow
                ? "We matched your courses and grades to your major. The remote browser has been closed."
                : "Import again only if you want to replace the courses we extracted."}
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" size="lg" onClick={openPortal} disabled={disabled}>
          Import again
        </Button>
      </div>
    )
  }

  // ── Not started ──
  if (!open) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Globe className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-medium text-foreground">Import from {universityName}'s student portal</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A secure browser opens right here. Sign in and open your transcript — no downloads or screenshots
                needed.
              </p>
            </div>
          </div>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span className="font-mono text-xs text-muted-foreground">{index + 1}</span>
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {title}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              Your password goes only to your university. AcadPath never reads or stores it, and the browser closes
              as soon as you're done.
            </p>
            <Button type="button" size="lg" onClick={openPortal} disabled={disabled} className="shrink-0">
              Open student portal
            </Button>
          </div>
        </div>

        {browser.error ? (
          <FormAlert title="The student portal couldn't open" message={browser.error} />
        ) : null}
      </div>
    )
  }

  // ── Live browser ──
  const host = status?.url ? safeHost(status.url) : null
  const onTranscript = Boolean(status?.onTranscript)

  return (
    <div className={cn(expanded && "fixed inset-0 z-50 flex flex-col bg-background p-2 sm:p-4")}>
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
          expanded && "min-h-0 flex-1",
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Back" onClick={() => browser.send({ type: "back" })} disabled={importing}>
            <ArrowLeft />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Reload" onClick={() => browser.send({ type: "reload" })} disabled={importing}>
            <RotateCw />
          </Button>
          <div className="mx-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Lock className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate" title={status?.url ?? undefined}>
              {host ?? "Connecting…"}
              {status?.title ? <span className="hidden sm:inline"> · {status.title}</span> : null}
            </span>
          </div>
          {status?.loggedIn ? (
            <Badge variant="secondary" className="hidden sm:inline-flex">Signed in</Badge>
          ) : null}
          {onTranscript ? (
            <Badge className="bg-success/10 text-success">Transcript found</Badge>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Exit full screen" : "Full screen"}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <Minimize2 /> : <Maximize2 />}
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close portal" onClick={browser.stop} disabled={importing}>
            <Square />
          </Button>
        </div>

        <PortalScreen
          browser={browser}
          overlay={importing ? "Reading your transcript… this can take a minute." : null}
          className={cn(expanded ? "min-h-0 flex-1" : "h-[min(70vh,600px)] min-h-80")}
        />

        {/* Status + import */}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {onTranscript
              ? "Your transcript is on screen. Import it when all your terms are visible."
              : status?.loggedIn
                ? "Now open your transcript or grades page — we'll detect it automatically."
                : "Click inside the portal and sign in. Ctrl+V pastes."}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {!onTranscript && status?.loggedIn ? (
              <Button type="button" variant="ghost" size="lg" onClick={runImport} disabled={importing || disabled}>
                Use this page anyway
              </Button>
            ) : null}
            <Button type="button" size="lg" onClick={runImport} disabled={!onTranscript || importing || disabled}>
              {importing ? "Importing…" : "Import transcript"}
            </Button>
          </div>
        </div>
      </div>

      {importTranscript.error ? (
        <FormAlert
          title="We couldn't import this page"
          message={errorMessage(importTranscript.error)}
          className="mt-4"
        />
      ) : null}
    </div>
  )
}

function safeHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
