import { combineSlices, type ThunkAction, type UnknownAction } from "@reduxjs/toolkit"

import { uploadsSlice } from "@/store/slices/uploads/uploads-slice"
import { toastSlice } from "@/store/slices/toast/toast-slice"

/** Slices used only by code-split routes (the advisor) add themselves here when their module loads. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended by module augmentation
export interface LazyLoadedSlices {}

export const rootReducer = combineSlices(uploadsSlice, toastSlice).withLazyLoadedSlices<LazyLoadedSlices>()

export type RootState = ReturnType<typeof rootReducer>
export type AppThunk<Result = void> = ThunkAction<Result, RootState, unknown, UnknownAction>
