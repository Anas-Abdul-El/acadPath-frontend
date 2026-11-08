import { describe, expect, it } from "vitest"

import { toChatRequest } from "@/api/advisor"
import { parseSse, type SseEvent } from "@/lib/sse"
import type { ChatMessage } from "@/types/advisor"

function streamOf(chunks: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

async function collect(chunks: string[]) {
  const events: SseEvent[] = []
  for await (const event of parseSse(streamOf(chunks))) events.push(event)
  return events
}

describe("parseSse", () => {
  it("parses events split at arbitrary chunk boundaries", async () => {
    const events = await collect([
      'event: delta\ndata: {"text":"Hel',
      'lo"}\n\nevent: del',
      'ta\ndata: {"text":" there"}\n',
      "\nevent: done\ndata: {}\n\n",
    ])
    expect(events).toEqual([
      { event: "delta", data: '{"text":"Hello"}' },
      { event: "delta", data: '{"text":" there"}' },
      { event: "done", data: "{}" },
    ])
  })

  it("handles CRLF line endings, comments and a final event without a blank line", async () => {
    const events = await collect([": keep-alive\r\n\r\nevent: error\r\ndata: {\"message\":\"down\"}"])
    expect(events).toEqual([{ event: "error", data: '{"message":"down"}' }])
  })
})

describe("toChatRequest", () => {
  const message = (role: ChatMessage["role"], content: string): ChatMessage => ({ id: crypto.randomUUID(), role, content })

  it("drops empty replies and keeps the last 20 messages, starting with the student", () => {
    const history: ChatMessage[] = []
    for (let i = 0; i < 15; i++) history.push(message("student", `q${i}`), message("assistant", i === 3 ? "" : `a${i}`))
    history.push(message("student", "  last question  "))

    const { messages } = toChatRequest(history)
    expect(messages).toHaveLength(19)
    expect(messages[0].role).toBe("student")
    expect(messages.at(-1)).toEqual({ role: "student", content: "last question" })
    expect(messages.some((m) => m.content === "")).toBe(false)
  })
})
