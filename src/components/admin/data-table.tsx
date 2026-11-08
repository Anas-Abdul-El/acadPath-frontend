import { useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SortDirection = "asc" | "desc"

export type Column<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  /** Makes the column sortable by this value. */
  sortValue?: (row: T) => string | number
  /** Hide on small screens to keep the table readable. */
  hideBelow?: "sm" | "md" | "lg"
  align?: "left" | "right"
  className?: string
}

/** Server-side paging: rows are already one page, and the API reports the total. */
export type ServerPagination = {
  /** 1-based, as the API counts. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

type DataTableProps<T> = {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  caption: string
  initialSort?: { id: string; direction: SortDirection }
  /** Rendered in the last column for each row (view / edit / delete). */
  actions?: (row: T) => ReactNode
  empty: ReactNode
  pageSize?: number
  /**
   * When set, paging is done by the server. Sorting is off in this mode: the API has no sort
   * parameter, and sorting one page would misrepresent the whole list.
   */
  pagination?: ServerPagination
  /** Dims the rows while a new page or filter loads. */
  busy?: boolean
}

const HIDE = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" }

/** Paginated table shared by every admin list: sortable on the client, or paged by the server. */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  initialSort,
  actions,
  empty,
  pageSize: clientPageSize = 10,
  pagination,
  busy = false,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(pagination ? undefined : initialSort)
  const [pageState, setPage] = useState(0)

  const sortColumn = pagination ? undefined : columns.find((column) => column.id === sort?.id)
  const sorted =
    sortColumn?.sortValue && sort
      ? [...rows].sort((a, b) => {
          const x = sortColumn.sortValue!(a)
          const y = sortColumn.sortValue!(b)
          const order = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))
          return sort.direction === "asc" ? order : -order
        })
      : rows

  const pageSize = pagination?.pageSize ?? clientPageSize
  const total = pagination?.total ?? sorted.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  // 0-based from here on.
  const page = pagination ? Math.min(pagination.page - 1, pageCount - 1) : Math.min(pageState, pageCount - 1)
  const visible = pagination ? rows : sorted.slice(page * pageSize, page * pageSize + pageSize)
  const goTo = (next: number) => (pagination ? pagination.onPageChange(next + 1) : setPage(next))

  const toggleSort = (id: string) => {
    setSort((current) =>
      current?.id === id ? { id, direction: current.direction === "asc" ? "desc" : "asc" } : { id, direction: "asc" },
    )
    setPage(0)
  }

  if (rows.length === 0) return <>{empty}</>

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* `relative` keeps absolutely positioned sr-only labels inside the scroll area on small screens */}
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] tracking-wide text-muted-foreground uppercase">
              {columns.map((column) => {
                const active = sort?.id === column.id
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "px-4 py-2.5 font-medium first:pl-5",
                      column.hideBelow && HIDE[column.hideBelow],
                      column.align === "right" && "text-right",
                    )}
                  >
                    {column.sortValue && !pagination ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded px-1 uppercase hover:text-foreground",
                          active && "text-foreground",
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort.direction === "asc" ? (
                            <ArrowUp aria-hidden="true" className="size-3" />
                          ) : (
                            <ArrowDown aria-hidden="true" className="size-3" />
                          )
                        ) : (
                          <ArrowUpDown aria-hidden="true" className="size-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
              {actions ? (
                <th scope="col" className="px-4 py-2.5 pr-5 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody aria-busy={busy} className={cn("transition-opacity", busy && "opacity-50")}>
            {visible.map((row) => (
              <tr key={getRowId(row)} className="border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/40">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "px-4 py-3 align-middle first:pl-5",
                      column.hideBelow && HIDE[column.hideBelow],
                      column.align === "right" && "text-right",
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
                {actions ? <td className="px-4 py-2 pr-5 text-right whitespace-nowrap">{actions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
          <p>
            {page * pageSize + 1}–{Math.min(total, (page + 1) * pageSize)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => goTo(page - 1)} disabled={page === 0 || busy} aria-label="Previous page">
              <ChevronLeft />
            </Button>
            <span className="px-1 font-tabular">
              Page {page + 1} of {pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => goTo(page + 1)}
              disabled={page >= pageCount - 1 || busy}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
