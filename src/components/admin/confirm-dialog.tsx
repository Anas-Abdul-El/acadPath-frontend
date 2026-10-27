import type { ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  /** Omit both to show an explanation-only dialog (e.g. when the action isn't allowed). */
  confirmLabel?: string
  onConfirm?: () => void
  /** Destructive actions get the red button. */
  destructive?: boolean
}

/** Standard "are you sure?" step for irreversible admin actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{onConfirm ? "Cancel" : "Close"}</AlertDialogCancel>
          {onConfirm ? (
            <AlertDialogAction
              variant={destructive ? "destructive" : "default"}
              className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : undefined}
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlertDialogAction>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
