import { useCallback, useState } from "react"

/**
 * Tracks one upload request: the bytes going up, then the wait while the server extracts the
 * files (it answers only once extraction is done).
 */
export function useUploadProgress(processingLabel: string) {
  const [percent, setPercent] = useState<number | null>(null)

  const start = useCallback(() => setPercent(0), [])
  const stop = useCallback(() => setPercent(null), [])

  const label = percent === null ? null : percent < 100 ? `Uploading… ${percent}%` : processingLabel

  return { label, onProgress: setPercent, start, stop }
}
