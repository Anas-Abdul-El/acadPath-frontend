import { useMutation, useQueryClient } from "@tanstack/react-query"

import { api, API_URL, LONG_TIMEOUT } from "@/api/client"
import { queryKeys } from "@/api/query-keys"
import type { DataEnvelope, PortalSessionDto, StudentDocumentDto } from "@/api/types"

/**
 * The remote student-portal browser. A headless browser runs on the AcadPath server;
 * the student sees it through a WebSocket stream, signs in to their university portal
 * and opens their transcript. The page is then parsed and sent to the AI.
 */

/** Starts the student's portal browser (or reuses it) and returns a fresh WebSocket ticket. */
export async function startPortalSession(): Promise<PortalSessionDto> {
  // Launching the browser and loading the portal can take a while.
  const { data } = await api.post<DataEnvelope<PortalSessionDto>>("/me/portal", undefined, {
    timeout: 60_000,
  })
  return data.data
}

export async function stopPortalSession(): Promise<void> {
  await api.delete("/me/portal")
}

/** The WebSocket URL for a session: same host as the API, ws(s) instead of http(s). */
export function portalSocketUrl({ socketPath, ticket }: Pick<PortalSessionDto, "socketPath" | "ticket">): string {
  const url = new URL(socketPath, new URL(API_URL, window.location.href))
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.searchParams.set("ticket", ticket)
  return url.toString()
}

/** Sends the transcript open in the portal to the AI and saves the extracted courses. */
export function useImportPortalTranscript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<DataEnvelope<StudentDocumentDto[]>>("/me/portal/transcript", undefined, {
        timeout: LONG_TIMEOUT,
      })
      return data.data
    },
    meta: { silent: true },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["me", "documents"] })
      queryClient.removeQueries({ queryKey: ["academics"] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.me, exact: true })
    },
  })
}
