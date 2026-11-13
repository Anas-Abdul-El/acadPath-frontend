import { useCallback, useEffect, useRef, useState } from "react"

import { errorMessage } from "@/api/errors"
import { portalSocketUrl, startPortalSession, stopPortalSession } from "@/api/portal"
import type { PortalStatusDto } from "@/api/types"

export type PortalPhase = "idle" | "starting" | "live" | "reconnecting" | "stopped" | "error"

/** One message the viewer sends to the remote browser (validated again on the server). */
export type PortalInput =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; deltaY: number }
  | { type: "key"; key: string }
  | { type: "text"; text: string }
  | { type: "back" }
  | { type: "reload" }
  | { type: "resize"; width: number; height: number }

type ServerMessage =
  | { type: "frame"; data: string }
  | ({ type: "status" } & PortalStatusDto)
  | { type: "stopped"; reason: string }

const MAX_RECONNECTS = 5

/**
 * Connects the onboarding page to the student's remote portal browser.
 *
 * Frames (JPEG screenshots) are written straight to `imageRef` instead of React state:
 * they arrive many times a second, and re-rendering for each one would be wasteful.
 * Status updates (URL, signed in, transcript detected) go through state.
 */
export function usePortalBrowser() {
  const [phase, setPhase] = useState<PortalPhase>("idle")
  const [status, setStatus] = useState<PortalStatusDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasFrame, setHasFrame] = useState(false)

  const imageRef = useRef<HTMLImageElement | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const wantOpen = useRef(false) // false once the student stops or leaves the page
  const attempts = useRef(0)
  const lastSize = useRef<{ width: number; height: number } | null>(null)

  const send = useCallback((input: PortalInput) => {
    const socket = socketRef.current
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(input))
  }, [])

  const fail = useCallback((err: unknown) => {
    wantOpen.current = false
    setPhase("error")
    setError(errorMessage(err))
  }, [])

  // Gets a ticket and opens the WebSocket. On a dropped connection it calls itself again.
  const connect = useCallback(() => {
    async function open(): Promise<void> {
      const session = await startPortalSession()
      if (!wantOpen.current) return
      setStatus(session.status)

      const socket = new WebSocket(portalSocketUrl(session))
      socketRef.current = socket

      socket.onopen = () => {
        attempts.current = 0
        setPhase("live")
        // The remote page takes the size of our view.
        if (lastSize.current) socket.send(JSON.stringify({ type: "resize", ...lastSize.current }))
      }

      socket.onmessage = (event: MessageEvent<string>) => {
        let message: ServerMessage
        try {
          message = JSON.parse(event.data) as ServerMessage
        } catch {
          return
        }
        if (message.type === "frame") {
          if (imageRef.current) imageRef.current.src = `data:image/jpeg;base64,${message.data}`
          setHasFrame(true)
        } else if (message.type === "status") {
          const { type, ...next } = message
          if (type === "status") setStatus(next)
        } else {
          wantOpen.current = false
          setPhase("stopped")
          setHasFrame(false)
          setStatus((current) => (current ? { ...current, running: false } : current))
          setError(message.reason === "Transcript imported" || message.reason === "Stopped" ? null : message.reason)
        }
      }

      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null
        if (!wantOpen.current) return
        // Dropped connection: get a new ticket and reconnect, a few times at most.
        if (attempts.current >= MAX_RECONNECTS) {
          wantOpen.current = false
          setPhase("error")
          setError("Lost the connection to the portal browser.")
          return
        }
        attempts.current += 1
        setPhase("reconnecting")
        window.setTimeout(() => {
          if (wantOpen.current) open().catch(fail)
        }, 1000 * attempts.current)
      }
    }
    return open()
  }, [fail])

  const start = useCallback(() => {
    wantOpen.current = true
    attempts.current = 0
    setError(null)
    setHasFrame(false)
    setPhase("starting")
    connect().catch(fail)
  }, [connect, fail])

  /** Closes the stream; `remote: true` also closes the browser on the server. */
  const close = useCallback((remote: boolean) => {
    wantOpen.current = false
    socketRef.current?.close()
    socketRef.current = null
    setHasFrame(false)
    if (remote) void stopPortalSession().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    close(true)
    setPhase("stopped")
    setStatus(null)
  }, [close])

  /** After a successful import the server already closed the browser. */
  const finish = useCallback(() => {
    close(false)
    setPhase("stopped")
  }, [close])

  const resize = useCallback(
    (width: number, height: number) => {
      lastSize.current = { width: Math.round(width), height: Math.round(height) }
      send({ type: "resize", ...lastSize.current })
    },
    [send],
  )

  // Leaving the page closes the remote browser instead of waiting for its idle timeout.
  useEffect(() => () => close(wantOpen.current), [close])

  return { phase, status, error, hasFrame, imageRef, start, stop, finish, send, resize }
}

export type PortalBrowser = ReturnType<typeof usePortalBrowser>
