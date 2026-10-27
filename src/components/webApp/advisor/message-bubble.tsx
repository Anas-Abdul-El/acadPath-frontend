import { Square } from "lucide-react"

import { MessageContent } from "@/components/webApp/advisor/message-content"
import { LogoMark } from "@/components/shared/logo"
import type { ChatMessage } from "@/types/advisor"

export function MessageBubble({ message, studentInitials }: { message: ChatMessage; studentInitials: string }) {
  if (message.role === "student") {
    return (
      <li className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-primary-foreground">
          <span className="sr-only">You: </span>
          {message.content}
        </div>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
        >
          {studentInitials}
        </span>
      </li>
    )
  }

  const thinking = message.pending && !message.content
  return (
    <li className="flex gap-3" aria-busy={message.pending}>
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-ink">
        <LogoMark className="size-5 brightness-0 invert" />
      </span>
      <div className="min-w-0 flex-1 pt-1 text-[0.9375rem] leading-relaxed text-foreground/90">
        <span className="sr-only">Advisor: </span>
        {thinking ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                  style={{ animationDelay: `${dot * 120}ms` }}
                />
              ))}
            </span>
            Thinking…
          </span>
        ) : (
          <>
            {message.content ? <MessageContent content={message.content} /> : null}
            {message.stopped ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Square aria-hidden="true" className="size-2.5 fill-current" />
                {message.content ? "Response stopped" : "Stopped before answering"}
              </p>
            ) : null}
            {message.pending ? (
              <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-primary/60" />
            ) : null}
          </>
        )}
      </div>
    </li>
  )
}
