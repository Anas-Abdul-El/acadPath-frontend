import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/webApp/sideBar/app-sidebar"
import { AppTopBar } from "@/components/layouts/app-topbar"
import { useSignOut } from "@/hooks/use-sign-out"
import { ROUTES } from "@/lib/routes"

/** Authenticated shell: sidebar on large screens, drawer on small ones. Guarded by `RequireAuth`. */
export function AppLayout() {
  const handleSignOut = useSignOut()
  const { pathname } = useLocation()

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
          <AppSidebar onSignOut={handleSignOut} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar onSignOut={handleSignOut} />
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
