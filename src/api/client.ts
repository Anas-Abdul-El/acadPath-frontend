import axios, { isCancel, type AxiosError, type InternalAxiosRequestConfig } from "axios"

import { ApiError } from "@/api/errors"
import { clearAccessToken, getAccessToken, setAccessToken } from "@/api/token"
import type { DataEnvelope } from "@/api/types"

/** AI calls and uploads (extraction runs inside the request) can take minutes. */
export const LONG_TIMEOUT = 5 * 60_000

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20_000,
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// ── Session expiry ───────────────────────────────────────────────────────────

let onSessionExpired: () => void = () => {}

/** Registered once by the query client: clears cached data so the route guards send the user to sign-in. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

export function endSession(): void {
  clearAccessToken()
  onSessionExpired()
}

// ── Refresh ──────────────────────────────────────────────────────────────────

let refreshing: Promise<string> | null = null

/**
 * Exchanges the refresh cookie for a new access token. Calls made at the same time share one
 * request: refresh tokens rotate, and the backend revokes the session when one is reused.
 */
export function refreshSession(): Promise<string> {
  refreshing ??= api
    .post<DataEnvelope<{ accessToken: string }>>("/auth/refresh")
    .then(({ data }) => {
      setAccessToken(data.data.accessToken)
      return data.data.accessToken
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

function isAuthRoute(url: string | undefined): boolean {
  return Boolean(url?.replace(/^\/+/, "").startsWith("auth/"))
}

// ── Interceptors ─────────────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !isAuthRoute(config.url)) config.headers.set("Authorization", `Bearer ${token}`)
  return config
})

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  if (isCancel(error)) throw error

  const config = error.config as RetriableConfig | undefined
  if (error.response?.status === 401 && config && !config._retry && !isAuthRoute(config.url)) {
    config._retry = true
    try {
      await refreshSession()
    } catch {
      endSession()
      throw ApiError.from(error)
    }
    return api(config)
  }

  throw ApiError.from(error)
})

/** GET that unwraps the `{ data }` envelope. */
export async function getData<T>(url: string, params?: object, signal?: AbortSignal): Promise<T> {
  const { data } = await api.get<DataEnvelope<T>>(url, { params, signal })
  return data.data
}
