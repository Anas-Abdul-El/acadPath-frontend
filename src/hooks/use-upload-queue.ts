import { useCallback, useMemo } from "react"

import { DOCUMENT_UPLOAD_CONFIG, type UploadConfig } from "@/lib/files/upload-config"
import type { AcceptedFile, RejectedFile } from "@/lib/files/validate-files"
import {
  addValidatedFiles,
  fileRemoved,
  queueReset,
  rejectedCleared,
  selectQueue,
  type UploadQueueId,
} from "@/store/slices/uploads/uploads-slice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

export type UploadQueue = ReturnType<typeof useUploadQueue>

/**
 * One multi-file selection from the store, plus the actions that change it. The files live in
 * Redux so they survive moving between onboarding steps; progress is simulated by the slice.
 */
export function useUploadQueue(id: UploadQueueId, config: UploadConfig = DOCUMENT_UPLOAD_CONFIG) {
  const dispatch = useAppDispatch()
  const { items, rejected } = useAppSelector((state) => selectQueue(state, id))

  const addValidated = useCallback(
    (accepted: AcceptedFile[], invalid: RejectedFile[]) => dispatch(addValidatedFiles(id, accepted, invalid)),
    [dispatch, id],
  )
  const removeFile = useCallback((fileId: string) => dispatch(fileRemoved({ queue: id, id: fileId })), [dispatch, id])
  const clearRejected = useCallback(() => dispatch(rejectedCleared(id)), [dispatch, id])
  const reset = useCallback(() => dispatch(queueReset(id)), [dispatch, id])

  const isSimulating = items.some((item) => item.status === "simulating")

  const totalSize = useMemo(() => items.reduce((sum, item) => sum + item.file.size, 0), [items])

  return {
    config,
    items,
    rejected,
    totalSize,
    isSimulating,
    addValidated,
    removeFile,
    clearRejected,
    reset,
  }
}
