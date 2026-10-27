import { useState } from "react"
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/webApp/sideBar/app-sidebar"
import { AppTopBar } from "@/components/layouts/app-topbar"
import { selectAccount, signOut } from "@/store/slices/onboarding/onboarding-slice"
import { ROUTES } from "@/lib/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/** Authenticated shell: sidebar on large screens, drawer on small ones. */
export function AppLayout() {
  const account = useAppSelector(selectAccount)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Without this flag, clearing the account would trip the guard and send the student to sign-in.
  const [signingOut, setSigningOut] = useState(false)

  if (!account) return signingOut ? null : <Navigate to={ROUTES.signIn} replace />

  const handleSignOut = () => {
    setSigningOut(true)
    dispatch(signOut())
    navigate(ROUTES.home)
  }

  const fullBleed = pathname === ROUTES.app.advisor

  return (
    <>
      <a
        href="#main"
        className="sr-only z-60 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh">
        <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r border-border bg-muted/50 lg:block">
          <AppSidebar account={account} onSignOut={handleSignOut} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar account={account} onSignOut={handleSignOut} />
          <main
            id="main"
            className={fullBleed ? "flex min-h-0 flex-1 flex-col" : "mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
