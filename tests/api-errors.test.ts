import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { describe, expect, it } from "vitest"

import { ApiError, applyFieldErrors, isCancelled } from "@/api/errors"

const config = { headers: {} } as InternalAxiosRequestConfig

function axiosError(status: number, data: unknown) {
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    status,
    data,
    statusText: "",
    headers: {},
    config,
  })
}

describe("ApiError.from", () => {
  it("reads the backend error envelope, including validation details", () => {
    const error = ApiError.from(
      axiosError(400, {
        error: { message: "Validation failed", details: [{ path: "email", message: "Enter a valid email address" }] },
      }),
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe("Validation failed")
    expect(error.details).toEqual([{ path: "email", message: "Enter a valid email address" }])
  })

  it("falls back to a readable message when the body has none", () => {
    expect(ApiError.from(axiosError(429, "Too Many Requests")).message).toMatch(/too many requests/i)
    expect(ApiError.from(axiosError(502, null)).status).toBe(502)
  })

  it("drops malformed details", () => {
    const error = ApiError.fromBody(400, { error: { message: "Bad", details: [{ path: 1 }, "x"] } })
    expect(error.details).toEqual([])
  })

  it("explains network failures and timeouts", () => {
    expect(ApiError.from(new AxiosError("Network Error", "ERR_NETWORK", config)).status).toBe(0)
    expect(ApiError.from(new AxiosError("timeout", "ECONNABORTED", config)).message).toMatch(/too long/)
  })

  it("passes an ApiError through unchanged", () => {
    const original = new ApiError("Nope", 404)
    expect(ApiError.from(original)).toBe(original)
  })
})

describe("isCancelled", () => {
  it("recognizes axios cancellations and aborted fetches", () => {
    expect(isCancelled(new AxiosError("canceled", "ERR_CANCELED"))).toBe(true)
    expect(isCancelled(new DOMException("aborted", "AbortError"))).toBe(true)
    expect(isCancelled(new ApiError("Nope", 500))).toBe(false)
  })
})

describe("applyFieldErrors", () => {
  it("sets errors only on known fields and reports whether any matched", () => {
    const calls: [string, string][] = []
    const setError = ((name: string, error: { message?: string }) => calls.push([name, error.message ?? ""])) as never
    const error = new ApiError("Validation failed", 400, [
      { path: "email", message: "Taken" },
      { path: "unknown", message: "Ignored" },
    ])
    expect(applyFieldErrors(error, setError, ["email", "password"])).toBe(true)
    expect(calls).toEqual([["email", "Taken"]])
    expect(applyFieldErrors(new ApiError("Server", 500), setError, ["email"])).toBe(false)
  })
})
