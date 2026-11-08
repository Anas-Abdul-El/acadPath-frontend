import { createAction } from "@reduxjs/toolkit"

/** Dispatched when the user signs in, signs out or the session expires; session-scoped slices reset on it. */
export const sessionReset = createAction("session/reset")
