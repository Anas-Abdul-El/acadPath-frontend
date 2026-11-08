import { api, LONG_TIMEOUT } from "@/api/client"
import type { DataEnvelope } from "@/api/types"
import type { ScenarioResult } from "@/types/what-if"

/** Analyzes a scenario against the student's real record and plan. Nothing is saved. */
export async function analyzeScenario(scenario: string, signal?: AbortSignal): Promise<ScenarioResult> {
  const { data } = await api.post<DataEnvelope<ScenarioResult>>(
    "/me/what-if",
    { scenario },
    { signal, timeout: LONG_TIMEOUT },
  )
  return data.data
}
