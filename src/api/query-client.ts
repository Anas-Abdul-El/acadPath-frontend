import { MutationCache, QueryClient } from "@tanstack/react-query"

import { setSessionExpiredHandler } from "@/api/client"
import { errorMessage, isApiError, isCancelled } from "@/api/errors"
import { queryKeys } from "@/api/query-keys"
import { store } from "@/store/store"
import { showToast } from "@/store/slices/toast/toast-slice"
import { sessionReset } from "@/store/session-actions"

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** The form shows the error itself, so no toast. */
      silent?: boolean
    }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Client errors won't fix themselves; give network and server errors one more try.
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status >= 400 && error.status < 500) return false
        return failureCount < 1
      },
    },
    mutations: { retry: false },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent || isCancelled(error)) return
      store.dispatch(showToast({ title: errorMessage(error), tone: "error" }))
    },
  }),
})

/** Drops every cached query and Redux session state. The route guards then redirect to sign-in. */
export function clearSessionData(): void {
  queryClient.cancelQueries()
  queryClient.removeQueries({
    predicate: (query) => !(query.queryKey.length === 1 && query.queryKey[0] === queryKeys.me[0]),
  })
  queryClient.setQueryData(queryKeys.me, null)
  store.dispatch(sessionReset())
}

setSessionExpiredHandler(clearSessionData)
