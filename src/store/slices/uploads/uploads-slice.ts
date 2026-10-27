import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { UploadKind } from "@/lib/files/upload-config"
import type { AcceptedFile, RejectedFile } from "@/lib/files/validate-files"
import { sessionReset, universitySaved } from "@/store/slices/onboarding/onboarding-slice"
import type { AppThunk } from "@/store/root-reducer"

/**
 * `simulating` — the prototype is animating a fake transfer; nothing leaves the browser.
 * `ready` — the file is held in memory for this tab and would be sent once a backend exists.
 */
export type UploadStatus = "simulating" | "ready"

export type UploadItem = {
  id: string
  file: File
  kind: UploadKind
  status: UploadStatus
  progress: number
}

/** University documents: course catalog files (step 3). Transcript: academic records (step 4). */
export type UploadQueueId = "universityDocuments" | "transcript"

type QueueState = { items: UploadItem[]; rejected: RejectedFile[] }

const emptyQueue = (): QueueState => ({ items: [], rejected: [] })

const initialState: Record<UploadQueueId, QueueState> = {
  universityDocuments: emptyQueue(),
  transcript: emptyQueue(),
}

const MB = 1024 * 1024

/** Larger files "transfer" more slowly so the simulation reads plausibly. */
const progressStep = (size: number) => Math.max(4, Math.min(24, 24 - (size / MB) * 0.8))

const isSimulating = (queue: QueueState) => queue.items.some((item) => item.status === "simulating")

/** Separate queues so the two upload steps track their files independently. Held in memory only. */
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
    progressTicked(state, action: PayloadAction<UploadQueueId>) {
      for (const item of state[action.payload].items) {
        if (item.status !== "simulating") continue
        item.progress = Math.min(100, item.progress + progressStep(item.file.size))
        if (item.progress >= 100) item.status = "ready"
      }
    },
    rejectedCleared(state, action: PayloadAction<UploadQueueId>) {
      state[action.payload].rejected = []
    },
    queueReset(state, action: PayloadAction<UploadQueueId>) {
      state[action.payload] = emptyQueue()
    },
  },
  extraReducers: (builder) => {
    builder
      // University documents describe one university — drop them when the student switches.
      .addCase(universitySaved, (state, action) => {
        if (action.payload.replaced) state.universityDocuments = emptyQueue()
      })
      .addCase(sessionReset, () => initialState)
  },
  selectors: {
    selectQueue: (state, queue: UploadQueueId) => state[queue],
  },
})

export const { filesAdded, fileRemoved, rejectedCleared, queueReset } = uploadsSlice.actions
export const { selectQueue } = uploadsSlice.selectors
const { progressTicked } = uploadsSlice.actions

const TICK_MS = 180
const timers = new Map<UploadQueueId, number>()

/** Advances the simulated transfer until every file in the queue is ready. */
const simulateTransfer =
  (queue: UploadQueueId): AppThunk =>
  (dispatch, getState) => {
    if (timers.has(queue)) return
    const timer = window.setInterval(() => {
      dispatch(progressTicked(queue))
      if (isSimulating(selectQueue(getState(), queue))) return
      window.clearInterval(timer)
      timers.delete(queue)
    }, TICK_MS)
    timers.set(queue, timer)
  }

/**
 * Adds files that were already validated (see `validateFiles`). Validation runs in the
 * uploader so the Zod schemas stay out of the bundle for pages that never upload.
 */
export const addValidatedFiles =
  (queue: UploadQueueId, accepted: AcceptedFile[], rejected: RejectedFile[]): AppThunk<{ added: number; rejected: number }> =>
  (dispatch) => {
    const items = accepted.map<UploadItem>(({ file, kind }) => ({
      id: crypto.randomUUID(),
      file,
      kind,
      status: "simulating",
      progress: 0,
    }))
    dispatch(filesAdded({ queue, items, rejected }))
    if (items.length > 0) dispatch(simulateTransfer(queue))
    return { added: items.length, rejected: rejected.length }
  }
