import { isAxiosError } from "axios"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

export type ErrorDetail = { path: string; message: string }

const FALLBACK_MESSAGE = "Something went wrong. Please try again."

type ErrorEnvelope = { error?: { message?: unknown; details?: unknown } }

function isErrorDetail(value: unknown): value is ErrorDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ErrorDetail).path === "string" &&
    typeof (value as ErrorDetail).message === "string"
  )
}

/** Every failed API call is turned into one of these, whatever the transport said. */
export class ApiError extends Error {
  readonly status: number
  readonly details: ErrorDetail[]

  constructor(message: string, status: number, details: ErrorDetail[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }

  /** Builds an ApiError from the `{ error: { message, details } }` envelope (or what's left of it). */
  static fromBody(status: number, body: unknown): ApiError {
    const error = (body as ErrorEnvelope | null)?.error
    const message = typeof error?.message === "string" && error.message ? error.message : defaultMessage(status)
    const details = Array.isArray(error?.details) ? error.details.filter(isErrorDetail) : []
    return new ApiError(message, status, details)
  }

  static from(err: unknown): ApiError {
    if (err instanceof ApiError) return err
    if (isAxiosError(err)) {
      if (err.response) return ApiError.fromBody(err.response.status, err.response.data)
      if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
        return new ApiError("The request took too long. Please try again.", 0)
      }
      if (err.code === "ERR_CANCELED") return new ApiError("Request cancelled.", 0)
      return new ApiError("Can't reach AcadPath right now. Check your connection and try again.", 0)
    }
    if (isAbortError(err)) return new ApiError("Request cancelled.", 0)
    return new ApiError(FALLBACK_MESSAGE, 0)
  }
}

function defaultMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again."
  if (status === 403) return "You don't have access to this."
  if (status === 404) return "We couldn't find that."
  if (status === 413) return "That upload is too large."
  if (status === 415) return "That file type isn't supported."
  if (status === 429) return "Too many requests. Please wait a few minutes and try again."
  if (status >= 500) return "AcadPath is having trouble right now. Please try again shortly."
  return FALLBACK_MESSAGE
}

export function isApiError(err: unknown, status?: number): err is ApiError {
  return err instanceof ApiError && (status === undefined || err.status === status)
}

/** A fetch abort is a DOMException, which isn't an `Error` in every environment. */
function isAbortError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { name?: unknown }).name === "AbortError"
}

/** True for requests the caller aborted on purpose; those never need an error message. */
export function isCancelled(err: unknown): boolean {
  if (isAxiosError(err)) return err.code === "ERR_CANCELED"
  return isAbortError(err)
}

export function errorMessage(err: unknown): string {
  return ApiError.from(err).message
}

/**
 * Puts a 400's field errors onto a react-hook-form form. Returns true when at least one field
 * matched, so the caller knows whether a general message is still needed.
 */
export function applyFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  const { details } = ApiError.from(err)
  let applied = false
  for (const detail of details) {
    const field = detail.path.split(".")[0] as Path<T>
    if (fields.includes(field)) {
      setError(field, { type: "server", message: detail.message })
      applied = true
    }
  }
  return applied
}
