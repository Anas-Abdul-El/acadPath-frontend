import { createSlice, type PayloadAction, type WithSlice } from "@reduxjs/toolkit"

import { sessionReset } from "@/store/slices/onboarding/onboarding-slice"
import { mockAdvisor } from "@/simulation/advisor/mock-advisor"
import { rootReducer, type AppThunk } from "@/store/root-reducer"
import type { AdvisorService, ChatMessage } from "@/types/advisor"

export type ChatStatus = "idle" | "thinking" | "streaming"

type AdvisorChatState = {
  messages: ChatMessage[]
  status: ChatStatus
  /** The reply currently streaming in; updates for any other reply are ignored. */
  replyId: string | null
}

const initialState: AdvisorChatState = { messages: [], status: "idle", replyId: null }

/** Swap in a real AI-backed service here; defaults to the local mock. */
const advisorService: AdvisorService = mockAdvisor

/** Holds the advisor conversation for the session, so it survives moving between app pages. */
const advisorChatSlice = createSlice({
  name: "advisorChat",
  initialState,
  reducers: {
    exchangeStarted(state, action: PayloadAction<{ question: ChatMessage; reply: ChatMessage }>) {
      state.messages.push(action.payload.question, action.payload.reply)
      state.status = "thinking"
      state.replyId = action.payload.reply.id
    },
    replyChunkReceived(state, action: PayloadAction<{ id: string; chunk: string }>) {
      if (state.replyId !== action.payload.id) return
      const reply = state.messages.find((message) => message.id === action.payload.id)
      if (reply) reply.content += action.payload.chunk
      state.status = "streaming"
    },
    replyFailed(state, action: PayloadAction<string>) {
      const reply = state.messages.find((message) => message.id === action.payload)
      if (reply && !reply.content) reply.content = "Sorry — I couldn't answer that. Please try again."
    },
    replyFinished(state, action: PayloadAction<{ id: string; stopped: boolean }>) {
      const reply = state.messages.find((message) => message.id === action.payload.id)
      if (reply) {
        reply.pending = false
        reply.stopped = action.payload.stopped
      }
      if (state.replyId !== action.payload.id) return
      state.status = "idle"
      state.replyId = null
    },
    chatCleared: () => initialState,
  },
  extraReducers: (builder) => {
    // A new or signed-out student starts with an empty conversation.
    builder.addCase(sessionReset, () => initialState)
  },
  selectors: {
    selectMessages: (state) => state.messages,
    selectChatStatus: (state) => state.status,
  },
})

declare module "@/store/root-reducer" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- registers this lazy slice
  export interface LazyLoadedSlices extends WithSlice<typeof advisorChatSlice> {}
}

// Registered when the advisor page's code loads.
const injectedChatSlice = advisorChatSlice.injectInto(rootReducer)

export const { selectMessages, selectChatStatus } = injectedChatSlice.selectors
const { exchangeStarted, replyChunkReceived, replyFailed, replyFinished, chatCleared } = injectedChatSlice.actions

let controller: AbortController | null = null

export const sendMessage =
  (text: string): AppThunk =>
  (dispatch, getState) => {
    const content = text.trim()
    if (!content || selectChatStatus(getState()) !== "idle") return

    const question: ChatMessage = { id: crypto.randomUUID(), role: "student", content }
    const reply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "", pending: true }
    const history = [...selectMessages(getState()), question]
    dispatch(exchangeStarted({ question, reply }))

    const current = new AbortController()
    controller = current

    void (async () => {
      try {
        for await (const chunk of advisorService.streamReply(history, current.signal))
          dispatch(replyChunkReceived({ id: reply.id, chunk }))
      } catch {
        if (!current.signal.aborted) dispatch(replyFailed(reply.id))
      } finally {
        dispatch(replyFinished({ id: reply.id, stopped: current.signal.aborted }))
        if (controller === current) controller = null
      }
    })()
  }

export const stopReply = (): AppThunk => () => controller?.abort()

export const resetChat = (): AppThunk => (dispatch) => {
  controller?.abort()
  controller = null
  dispatch(chatCleared())
}
