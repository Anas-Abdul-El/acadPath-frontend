import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { UploadKind } from "@/lib/files/upload-config"
import type { AcceptedFile, RejectedFile } from "@/lib/files/validate-files"
import { sessionReset } from "@/store/session-actions"
import type { AppThunk } from "@/store/root-reducer"

/** A file the student picked and that passed local validation; it's sent when the step is submitted. */
export type UploadItem = {
  id: string
  file: File
  kind: UploadKind
}

/** University documents: course catalog files. Transcript: academic records. */
export type UploadQueueId = "universityDocuments" | "transcript"

type QueueState = { items: UploadItem[]; rejected: RejectedFile[] }

const emptyQueue = (): QueueState => ({ items: [], rejected: [] })

const initialState: Record<UploadQueueId, QueueState> = {
  universityDocuments: emptyQueue(),
  transcript: emptyQueue(),
}

/** Separate queues so the two upload steps keep their selections independently. Held in memory only. */
export const uploadsSlice = createSlice({
  name: "uploads",
  initialState,
  reducers: {
    filesAdded(state, action: PayloadAction<{ queue: UploadQueueId; items: UploadItem[]; rejected: RejectedFile[] }>) {
      const queue = state[action.payload.queue]
      queue.items.push(...action.payload.items)
      queue.rejected = action.payload.rejected
    },
    fileRemoved(state, action: PayloadAction<{ queue: UploadQueueId; id: string }>) {
      const queue = state[action.payload.queue]
      queue.items = queue.items.filter((item) => item.id !== action.payload.id)
    },
    rejectedCleared(state, action: PayloadAction<UploadQueueId>) {
      state[action.payload].rejected = []
    },
    queueReset(state, action: PayloadAction<UploadQueueId>) {
      state[action.payload] = emptyQueue()
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionReset, () => initialState)
  },
  selectors: {
    selectQueue: (state, queue: UploadQueueId) => state[queue],
  },
})

export const { filesAdded, fileRemoved, rejectedCleared, queueReset } = uploadsSlice.actions
export const { selectQueue } = uploadsSlice.selectors

/**
 * Adds files that were already validated (see `validateFiles`). Validation runs in the
 * uploader so the Zod schemas stay out of the bundle for pages that never upload.
 */
export const addValidatedFiles =
  (queue: UploadQueueId, accepted: AcceptedFile[], rejected: RejectedFile[]): AppThunk<{ added: number; rejected: number }> =>
  (dispatch) => {
    const items = accepted.map<UploadItem>(({ file, kind }) => ({ id: crypto.randomUUID(), file, kind }))
    dispatch(filesAdded({ queue, items, rejected }))
    return { added: items.length, rejected: rejected.length }
  }
