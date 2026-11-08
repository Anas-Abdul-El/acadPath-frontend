import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { signOut } from "@/api/auth"
import { ROUTES } from "@/lib/routes"

/**
 * Leaves for the landing page first, then ends the session, so the route guards never see a
 * signed-out user on a protected page and bounce to sign-in.
 */
export function useSignOut() {
  const navigate = useNavigate()
  return useCallback(() => {
    navigate(ROUTES.home)
    void signOut()
  }, [navigate])
}
