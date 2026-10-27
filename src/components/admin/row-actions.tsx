import { Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type RowActionsProps = {
  /** Used in accessible labels, e.g. "View University of Jordan". */
  name: string
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

/** View / edit / delete icon buttons for a table row. */
export function RowActions({ name, onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {onView ? (
        <Button variant="ghost" size="icon-sm" onClick={onView} aria-label={`View ${name}`} title="View">
          <Eye />
        </Button>
      ) : null}
      {onEdit ? (
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${name}`} title="Edit">
          <Pencil />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Delete ${name}`}
          title="Delete"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  )
}
