import { configureStore } from "@reduxjs/toolkit"

import { writePersisted } from "@/store/slices/onboarding/onboarding-slice"
import { filesAdded } from "@/store/slices/uploads/uploads-slice"
import { rootReducer } from "@/store/root-reducer"

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Selected files are held in memory as `File` objects until a backend can receive them.
      serializableCheck: {
        ignoredActions: [filesAdded.type],
        ignoredPaths: [/^uploads\.\w+\.items\.\d+\.file$/],
      },
    }),
})

// Mirror the non-sensitive onboarding progress to sessionStorage whenever it changes.
let persisted = store.getState().onboarding.persisted
store.subscribe(() => {
  const next = store.getState().onboarding.persisted
  if (next === persisted) return
  persisted = next
  writePersisted(next)
})

export type AppStore = typeof store
export type AppDispatch = AppStore["dispatch"]
