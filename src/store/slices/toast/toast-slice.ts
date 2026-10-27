import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { AppThunk } from "@/store/root-reducer"

export type ToastTone = "success" | "error" | "info"
export type Toast = { id: string; title: string; description?: string; tone: ToastTone }
export type ShowToast = (toast: Omit<Toast, "id">) => void

const DURATION_MS = 5000

export const toastSlice = createSlice({
  name: "toasts",
  initialState: [] as Toast[],
  reducers: {
    // At most three on screen; the oldest makes room for the newest.
    toastShown: (state, action: PayloadAction<Toast>) => [...state.slice(-2), action.payload],
    toastDismissed: (state, action: PayloadAction<string>) => state.filter((toast) => toast.id !== action.payload),
  },
  selectors: {
    selectToasts: (state) => state,
  },
})

export const { selectToasts } = toastSlice.selectors
const { toastShown, toastDismissed } = toastSlice.actions

const timers = new Map<string, number>()

export const dismissToast =
  (id: string): AppThunk =>
  (dispatch) => {
    window.clearTimeout(timers.get(id))
    timers.delete(id)
    dispatch(toastDismissed(id))
  }

export const showToast =
  (toast: Omit<Toast, "id">): AppThunk =>
  (dispatch) => {
    const id = crypto.randomUUID()
    dispatch(toastShown({ ...toast, id }))
    timers.set(id, window.setTimeout(() => dispatch(dismissToast(id)), DURATION_MS))
  }
