import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"

type Value = string | number | null | undefined

/**
 * Page, search and filters for an admin list, kept in the URL so a view can be shared and
 * survives a refresh. Changing anything but the page goes back to page 1.
 */
export function useListParams<F extends string>(filterKeys: readonly F[]) {
  const [params, setParams] = useSearchParams()

  const page = Math.max(1, Number.parseInt(params.get("page") ?? "", 10) || 1)
  const q = params.get("q") ?? ""
  const filters = Object.fromEntries(filterKeys.map((key) => [key, params.get(key) ?? ""])) as Record<F, string>

  const set = useCallback(
    (updates: Partial<Record<F | "q" | "page", Value>>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(updates) as [string, Value][]) {
            if (value === null || value === undefined || value === "" || value === "all") next.delete(key)
            else next.set(key, String(value))
          }
          if (!("page" in updates)) next.delete("page")
          if (next.get("page") === "1") next.delete("page")
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams])

  const hasFilters = Boolean(q) || filterKeys.some((key) => Boolean(filters[key]))

  return { page, q, filters, set, clear, hasFilters }
}
