import { useCallback } from "react"

import { useAppDispatch } from "@/store/hooks"
import { showToast, type ShowToast } from "@/store/slices/toast/toast-slice"

/** Shows a short, auto-dismissing status message (announced to screen readers by <Toaster />). */
export function useToast(): ShowToast {
  const dispatch = useAppDispatch()
  return useCallback((toast) => dispatch(showToast(toast)), [dispatch])
}
