import { ArrowLeft, LogOut } from "lucide-react"
import { Link } from "react-router-dom"

import { useCurrentUser } from "@/api/me"
import { SidebarNav } from "@/components/layouts/sidebar-nav"
import { LogoMark } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { adminNavigation } from "@/data/admin-navigation"
import { useSignOut } from "@/hooks/use-sign-out"
import { initialsOf } from "@/lib/initials"
import { ROUTES } from "@/lib/routes"

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useCurrentUser()
  const signOut = useSignOut()

  return (
    <div className="flex h-full flex-col bg-surface-ink p-3 text-surface-ink-foreground">
      <Link to={ROUTES.admin.dashboard} onClick={onNavigate} className="flex items-center gap-2 rounded-md px-2.5 py-2">
        <LogoMark className="size-7 brightness-0 invert" />
        <span className="text-[1.0625rem] font-semibold tracking-tight">AcadPath</span>
        <span className="ml-1 rounded-full border border-highlight/50 px-1.5 py-px font-mono text-[10px] tracking-wide text-highlight uppercase">
          Admin
        </span>
      </Link>

      <div className="mt-6">
        <SidebarNav items={adminNavigation} rootPath={ROUTES.admin.dashboard} label="Admin" tone="dark" onNavigate={onNavigate} />
      </div>

      <div className="mt-auto space-y-3">
        <Button
          asChild
          variant="ghost"
          size="lg"
          className="w-full justify-start text-surface-ink-foreground/70 hover:bg-surface-ink-foreground/8 hover:text-surface-ink-foreground"
        >
          <Link to={ROUTES.home}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Exit admin
          </Link>
        </Button>

        <div className="flex items-center gap-2.5 border-t border-surface-ink-foreground/15 px-1 pt-3">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-ink-foreground/10 text-xs font-medium"
          >
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-surface-ink-foreground/60">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            aria-label="Sign out"
            className="text-surface-ink-foreground/70 hover:bg-surface-ink-foreground/8 hover:text-surface-ink-foreground"
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  )
}
