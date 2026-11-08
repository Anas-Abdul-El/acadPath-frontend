export type ChatRole = "student" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  /** True while the assistant's reply is still streaming in. */
  pending?: boolean
  /** True when the student stopped the reply before it finished. */
  stopped?: boolean
  /** Why the reply failed, when it did (shown under whatever arrived before the failure). */
  error?: string
}

/** What the chat UI needs from the advisor backend: a stream of text chunks for one reply. */
export type AdvisorService = {
  streamReply: (history: ChatMessage[], signal: AbortSignal) => AsyncGenerator<string>
}
