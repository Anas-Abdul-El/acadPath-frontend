/**
 * The access token lives only in memory. The refresh token is an httpOnly cookie the browser
 * sends to /api/auth on its own.
 *
 * `has-session` is a non-sensitive hint in localStorage: it lets a cold start skip the refresh
 * call for visitors who were never signed in, because failed /api/auth calls count toward the
 * auth rate limit.
 */
const SESSION_HINT_KEY = "acadpath:has-session"

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
  try {
    localStorage.setItem(SESSION_HINT_KEY, "1")
  } catch {
    // Storage can be unavailable (private mode); the session still works for this tab.
  }
}

export function clearAccessToken(): void {
  accessToken = null
  try {
    localStorage.removeItem(SESSION_HINT_KEY)
  } catch {
    // ignore
  }
}

export function hasSessionHint(): boolean {
  if (accessToken) return true
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "1"
  } catch {
    return false
  }
}
