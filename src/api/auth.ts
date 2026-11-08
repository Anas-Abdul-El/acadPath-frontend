import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api } from "@/api/client"
import { fetchMe } from "@/api/me"
import { clearSessionData } from "@/api/query-client"
import { queryKeys } from "@/api/query-keys"
import { clearAccessToken, setAccessToken } from "@/api/token"
import type { DataEnvelope, MeDto, RegisterRequest, SessionDto, SignInRequest } from "@/api/types"

/** Stores the new session, then loads the full `/me` (profile and onboarding) before resolving. */
async function startSession(session: SessionDto): Promise<MeDto> {
  // A different user in the same tab must not inherit cached data or staged files.
  clearSessionData()
  setAccessToken(session.accessToken)
  const me = await fetchMe()
  if (!me) throw new Error("Could not load your account")
  return me
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: SignInRequest) => {
      const { data } = await api.post<DataEnvelope<SessionDto>>("/auth/login", body)
      return startSession(data.data)
    },
    meta: { silent: true },
    onSuccess: (me) => queryClient.setQueryData(queryKeys.me, me),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const { data } = await api.post<DataEnvelope<SessionDto>>("/auth/signin", body)
      return startSession(data.data)
    },
    meta: { silent: true },
    onSuccess: (me) => queryClient.setQueryData(queryKeys.me, me),
  })
}

/** Ends the session locally even when the logout call fails; the server answers 204 regardless. */
export async function signOut(): Promise<void> {
  try {
    await api.post("/auth/logout")
  } catch {
    // The cookie may already be gone; signing out locally is what matters.
  } finally {
    clearAccessToken()
    clearSessionData()
  }
}
