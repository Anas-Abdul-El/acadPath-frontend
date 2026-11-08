import { API_URL, endSession, refreshSession } from "@/api/client"
import { ApiError } from "@/api/errors"
import { getAccessToken } from "@/api/token"
import { parseSse } from "@/lib/sse"
import type { AdvisorService, ChatMessage } from "@/types/advisor"

const MAX_MESSAGES = 20
const MAX_ASSISTANT_LENGTH = 8000
const UNAVAILABLE = "The advisor is unavailable right now."

/** The history the API accepts: 1–20 messages, oldest first, no empty replies, ending with the student. */
export function toChatRequest(history: ChatMessage[]) {
  const messages = history
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content:
        message.role === "assistant" ? message.content.slice(0, MAX_ASSISTANT_LENGTH) : message.content.trim(),
    }))
    .slice(-MAX_MESSAGES)
  // The window must not start with an orphaned reply.
  while (messages.length > 1 && messages[0].role === "assistant") messages.shift()
  return { messages }
}

function post(body: string, signal: AbortSignal): Promise<Response> {
  const token = getAccessToken()
  return fetch(`${API_URL}/me/advisor/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
    credentials: "include",
    signal,
  })
}

async function errorFrom(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null)
  return ApiError.fromBody(response.status, body)
}

/**
 * Streams the advisor's reply over SSE. `fetch` instead of axios, because axios can't read a
 * response body as it arrives in the browser; the 401 → refresh → retry rule is repeated here.
 */
export const advisorService: AdvisorService = {
  async *streamReply(history, signal) {
    const body = JSON.stringify(toChatRequest(history))

    let response = await post(body, signal)
    if (response.status === 401) {
      try {
        await refreshSession()
      } catch {
        endSession()
        throw await errorFrom(response)
      }
      response = await post(body, signal)
    }
    if (!response.ok) throw await errorFrom(response)
    if (!response.body) throw new ApiError(UNAVAILABLE, 502)

    for await (const { event, data } of parseSse(response.body)) {
      if (event === "delta") {
        const { text } = JSON.parse(data) as { text?: string }
        if (text) yield text
      } else if (event === "error") {
        const { message } = JSON.parse(data) as { message?: string }
        throw new ApiError(message || UNAVAILABLE, 502)
      } else if (event === "done") {
        return
      }
    }
  },
}
