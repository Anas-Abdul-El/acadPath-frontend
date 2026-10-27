import { CircleAlert, CircleCheck, Info, X } from "lucide-react"

import { dismissToast, selectToasts } from "@/store/slices/toast/toast-slice"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

const TONE = {
  success: { icon: CircleCheck, className: "text-success" },
  error: { icon: CircleAlert, className: "text-destructive" },
  info: { icon: Info, className: "text-primary" },
}

/** Renders the toasts queued with `useToast`. Mount once per layout that shows them. */
export function Toaster() {
  const toasts = useAppSelector(selectToasts)
  const dispatch = useAppDispatch()

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-16 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:top-auto sm:bottom-6 sm:left-6 sm:items-start lg:left-[17.5rem]"
    >
      {toasts.map((toast) => {
        const { icon: Icon, className } = TONE[toast.tone]
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm gap-3 rounded-lg border border-border bg-popover p-3.5 shadow-[0_12px_32px_-12px_rgb(20_35_70/0.3)] data-open:animate-in sm:w-96"
            data-open=""
          >
            <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", className)} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-foreground">{toast.title}</p>
              {toast.description ? <p className="mt-0.5 text-muted-foreground">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dispatch(dismissToast(toast.id))}
              aria-label="Dismiss"
              className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
