import { useState } from "react"
import { ChevronRight, Menu } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"

import { AdminSidebar } from "@/components/admin/sidebar/admin-sidebar"
import { Toaster } from "@/components/shared/toaster"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { adminNavigation } from "@/data/admin-navigation"
import { ROUTES } from "@/lib/routes"

/** Admin console shell: ink sidebar (drawer on small screens), breadcrumbs, toasts. */
export function AdminLayout() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = adminNavigation.find((item) => item.to === pathname)
  const onDashboard = pathname === ROUTES.admin.dashboard

  return (
    <>
        <a
          href="#main"
          className="sr-only z-60 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <div className="flex min-h-svh">
          <aside className="sticky top-0 hidden h-svh w-64 shrink-0 lg:block">
            <AdminSidebar />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="-ml-2 lg:hidden"
                  aria-label="Open navigation"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu />
                </Button>
                <SheetContent side="left" className="w-72 border-0 p-0 [&>button]:text-surface-ink-foreground">
                  <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                  <SheetDescription className="sr-only">AcadPath admin sections</SheetDescription>
                  <AdminSidebar onNavigate={() => setMenuOpen(false)} />
                </SheetContent>
              </Sheet>

              <nav aria-label="Breadcrumb" className="min-w-0">
                <ol className="flex items-center gap-1.5 text-sm">
                  <li>
                    {onDashboard ? (
                      <span className="text-muted-foreground">Admin</span>
                    ) : (
                      <Link to={ROUTES.admin.dashboard} className="text-muted-foreground hover:text-foreground">
                        Admin
                      </Link>
                    )}
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-3.5 text-muted-foreground/60" />
                  </li>
                  <li className="truncate">
                    <span aria-current="page" className="text-foreground">
                      {current?.label ?? "Dashboard"}
                    </span>
                  </li>
                </ol>
              </nav>

              <span className="ml-auto hidden rounded-full border border-dashed border-highlight/70 bg-highlight/10 px-2.5 py-0.5 text-[11px] text-highlight-foreground sm:inline">
                Sample data · changes reset on refresh
              </span>
            </header>

            <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>
      <Toaster />
    </>
  )
}
