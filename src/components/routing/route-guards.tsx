import type { ReactNode } from "react"
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom"

import { useMe } from "@/api/me"
import type { UserRole } from "@/api/types"
import { PageLoader, QueryError } from "@/components/shared/query-state"
import { canVisitStep, homeFor, nextOnboardingStep, redirectTarget } from "@/lib/onboarding"
import { ROUTES } from "@/lib/routes"

type RequireAuthProps = {
  role: UserRole
  /**
   * Students only. `done`: the app, which needs finished onboarding.
   * `pending`: the onboarding steps, which close once it's finished.
   */
  onboarding?: "done" | "pending"
  children?: ReactNode
}

/** Renders its routes only for a signed-in user with the right role and onboarding state. */
export function RequireAuth({ role, onboarding, children }: RequireAuthProps) {
  const { data: me, isPending, error, refetch } = useMe()
  const location = useLocation()

  if (isPending) return <PageLoader className="min-h-svh" />
  if (error) return <QueryError error={error} onRetry={() => refetch()} className="m-6" />

  if (!me) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`${ROUTES.signIn}?next=${encodeURIComponent(next)}`} replace />
  }
  if (me.user.role !== role) return <Navigate to={homeFor(me)} replace />

  if (role === "STUDENT" && me.onboarding) {
    const completed = me.onboarding.completed
    if (onboarding === "done" && !completed) return <Navigate to={nextOnboardingStep(me.onboarding)} replace />
    if (onboarding === "pending") {
      if (completed) return <Navigate to={ROUTES.app.overview} replace />
      if (!canVisitStep(location.pathname, me.onboarding)) {
        return <Navigate to={nextOnboardingStep(me.onboarding)} replace />
      }
    }
  }

  return children ?? <Outlet />
}

/** Sign-in and sign-up: a signed-in user goes straight to where they belong (or `?next=`). */
export function RedirectIfAuthed() {
  const { data: me } = useMe()
  const [params] = useSearchParams()

  if (me) return <Navigate to={redirectTarget(me, params.get("next"))} replace />
  return <Outlet />
}
