export type ChatRole = "student" | "assistant"

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  /** True while the assistant's reply is still streaming in. */
  pending?: boolean
  /** True when the student stopped the reply before it finished. */
  stopped?: boolean
}

/**
 * What the chat UI needs from an advisor backend. The mock implements it locally; a real
 * AI integration only has to provide the same streaming function.
 */
export type AdvisorService = {
  streamReply: (history: ChatMessage[], signal: AbortSignal) => AsyncGenerator<string>
}
