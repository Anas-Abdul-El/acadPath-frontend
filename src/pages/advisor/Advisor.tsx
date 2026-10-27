import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, RotateCcw, Square } from "lucide-react"

import { AiBadge } from "@/components/shared/ai-badge"
import { AdvisorEmptyState } from "@/components/webApp/advisor/advisor-empty-state"
import { MessageBubble } from "@/components/webApp/advisor/message-bubble"
import { Button } from "@/components/ui/button"
import { resetChat, selectChatStatus, selectMessages, sendMessage, stopReply } from "@/store/slices/advisor-chat/advisor-chat-slice"
import { initialsOf } from "@/lib/initials"
import { selectAccount } from "@/store/slices/onboarding/onboarding-slice"
import { CHAT_MESSAGE_MAX, chatMessageSchema } from "@/schemas/chat"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export function AdvisorPage() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(selectMessages)
  const status = useAppSelector(selectChatStatus)
  const account = useAppSelector(selectAccount)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const busy = status !== "idle"
  const lastReply = [...messages].reverse().find((message) => message.role === "assistant")

  // Keep the newest message in view while a reply streams in.
  useEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  const submit = (text: string) => {
    const parsed = chatMessageSchema.safeParse(text)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Type a question first.")
      return
    }
    if (busy) return
    setError(null)
    dispatch(sendMessage(parsed.data))
    setDraft("")
    inputRef.current?.focus()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit(draft)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit(draft)
    }
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <title>AI Advisor · AcadPath</title>

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">AI Advisor</h1>
              <AiBadge>Simulated responses</AiBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Ask about your courses, GPA, prerequisites, or plan.</p>
          </div>
          {messages.length > 0 ? (
            <Button variant="outline" size="lg" onClick={() => dispatch(resetChat())} className="bg-background">
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              New chat
            </Button>
          ) : null}
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          {messages.length === 0 ? (
            <AdvisorEmptyState onPick={submit} />
          ) : (
            <ol aria-label="Conversation" className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} studentInitials={initialsOf(account?.name ?? "You")} />
              ))}
            </ol>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {status === "thinking" ? "Advisor is thinking." : status === "idle" && lastReply && !lastReply.pending ? "Advisor replied." : ""}
      </p>

      <div className="border-t border-border bg-background px-4 pt-3 pb-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div
            className={cn(
              "flex items-end gap-2 rounded-xl border bg-card p-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
              error ? "border-destructive/60" : "border-input",
            )}
          >
            <label htmlFor="advisor-input" className="sr-only">
              Message the AI Advisor
            </label>
            <textarea
              ref={inputRef}
              id="advisor-input"
              rows={1}
              value={draft}
              maxLength={CHAT_MESSAGE_MAX}
              onChange={(event) => {
                setDraft(event.target.value)
                if (error) setError(null)
              }}
              onKeyDown={onKeyDown}
              placeholder="Ask about your courses, GPA, or plan…"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "advisor-input-error" : "advisor-input-hint"}
              className="field-sizing-content max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.9375rem] outline-none placeholder:text-muted-foreground"
            />
            {busy ? (
              <Button type="button" size="icon-lg" variant="secondary" onClick={() => dispatch(stopReply())} aria-label="Stop generating">
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon-lg" aria-label="Send message" disabled={!draft.trim()}>
                <ArrowUp />
              </Button>
            )}
          </div>
          {error ? (
            <p id="advisor-input-error" role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          ) : (
            <p id="advisor-input-hint" className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              Prototype: answers are simulated from sample data, not a live AI model. Confirm decisions with your academic
              advisor.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
