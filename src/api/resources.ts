import { api, LONG_TIMEOUT } from "@/api/client"
import type { DataEnvelope, QuizDto, QuizRequest, ResourceSearchDto, ResourceSearchRequest } from "@/api/types"

/** AI resource search: stored resources plus new ones the AI finds (saved unverified). */
export async function searchResources(body: ResourceSearchRequest, signal?: AbortSignal): Promise<ResourceSearchDto> {
  const { data } = await api.post<DataEnvelope<ResourceSearchDto>>(
    "/resources/search",
    { ...body, goal: body.goal?.trim() || undefined },
    { signal, timeout: LONG_TIMEOUT },
  )
  return data.data
}

/** Generates a practice quiz. It isn't stored; answers are included so scoring happens here. */
export async function generateQuiz(body: QuizRequest, signal?: AbortSignal): Promise<QuizDto> {
  const { data } = await api.post<DataEnvelope<QuizDto>>("/quizzes", body, { signal, timeout: LONG_TIMEOUT })
  return data.data
}
