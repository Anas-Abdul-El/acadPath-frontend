import type { ReactNode } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}

/** Dialog sized for add/edit forms; the form inside renders its own footer. */
export function FormDialog({ open, onOpenChange, title, description, children }: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-display text-2xl font-normal tracking-tight">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

/** Sticky footer row for a form inside FormDialog. */
export function FormDialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-border bg-muted/60 px-5 py-3 backdrop-blur sm:flex-row sm:justify-end">
      {children}
    </div>
  )
}
