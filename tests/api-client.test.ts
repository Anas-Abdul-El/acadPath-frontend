import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { api, getData, setSessionExpiredHandler } from "@/api/client"
import { ApiError } from "@/api/errors"
import { clearAccessToken, getAccessToken, hasSessionHint, setAccessToken } from "@/api/token"

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response = { data, status, statusText: "", headers: {}, config }
  if (status >= 400) return Promise.reject(new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, response))
  return Promise.resolve(response)
}

const originalAdapter = api.defaults.adapter

describe("api client session handling", () => {
  let refreshCalls: number
  let refreshStatus: number
  const onExpired = vi.fn()

  beforeEach(() => {
    refreshCalls = 0
    refreshStatus = 200
    onExpired.mockReset()
    setSessionExpiredHandler(onExpired)
    setAccessToken("expired-token")

    const adapter: AxiosAdapter = async (config) => {
      if (config.url === "/auth/refresh") {
        refreshCalls += 1
        // Resolve on a later tick so concurrent 401s really overlap.
        await new Promise((resolve) => setTimeout(resolve, 10))
        return refreshStatus === 200
          ? respond(config, 200, { data: { accessToken: "fresh-token" } })
          : respond(config, refreshStatus, { error: { message: "Session expired" } })
      }
      const authorization = config.headers?.Authorization
      return authorization === "Bearer fresh-token"
        ? respond(config, 200, { data: config.url })
        : respond(config, 401, { error: { message: "Invalid token" } })
    }
    api.defaults.adapter = adapter
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
    clearAccessToken()
  })

  it("refreshes once for concurrent 401s and retries each request", async () => {
    const results = await Promise.all([getData("/me"), getData("/me/courses"), getData("/me/study-plan")])

    expect(results).toEqual(["/me", "/me/courses", "/me/study-plan"])
    expect(refreshCalls).toBe(1)
    expect(getAccessToken()).toBe("fresh-token")
    expect(onExpired).not.toHaveBeenCalled()
  })

  it("ends the session when the refresh fails", async () => {
    refreshStatus = 401

    await expect(getData("/me")).rejects.toBeInstanceOf(ApiError)
    expect(refreshCalls).toBe(1)
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBeNull()
    expect(hasSessionHint()).toBe(false)
  })

  it("never tries to refresh after a failed auth call", async () => {
    await expect(api.post("/auth/login", {})).rejects.toMatchObject({ status: 401 })
    expect(refreshCalls).toBe(0)
  })
})
