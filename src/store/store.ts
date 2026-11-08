import { configureStore } from "@reduxjs/toolkit"

import { filesAdded } from "@/store/slices/uploads/uploads-slice"
import { rootReducer } from "@/store/root-reducer"

/**
 * UI state only: toasts, the files staged for upload and the advisor chat transcript.
 * Server data lives in the TanStack Query cache (see `api/query-client.ts`).
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Staged files are held as `File` objects until the step uploads them.
      serializableCheck: {
        ignoredActions: [filesAdded.type],
        ignoredPaths: [/^uploads\.\w+\.items\.\d+\.file$/],
      },
    }),
})

export type AppStore = typeof store
export type AppDispatch = AppStore["dispatch"]
