import { LogOut } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { SidebarNav } from "@/components/layouts/sidebar-nav"
import { Button } from "@/components/ui/button"
import { catalogInfo } from "@/mock/academic/course-catalog"
import { appNavigation } from "@/data/app-navigation"
import { studentProfile } from "@/mock/academic/student-record"
import type { Account } from "@/simulation/auth/mock-auth"
import { initialsOf } from "@/lib/initials"
import { ROUTES } from "@/lib/routes"

type AppSidebarProps = {
  account: Account
  onSignOut: () => void
  onNavigate?: () => void
}

export function AppSidebar({ account, onSignOut, onNavigate }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="px-2.5 py-2">
        <Logo />
      </div>

      <div className="mt-6">
        <SidebarNav items={appNavigation} rootPath={ROUTES.app.overview} label="App" onNavigate={onNavigate} />
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-medium text-foreground">{studentProfile.program}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {catalogInfo.university} · {studentProfile.year}
          </p>
          <p className="mt-2 border-t border-dashed border-border pt-2 text-[11px] leading-snug text-muted-foreground">
            Showing sample academic data while document processing is in development.
          </p>
        </div>

        <div className="flex items-center gap-2.5 px-1">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
          >
            {initialsOf(account.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
            <p className="truncate text-xs text-muted-foreground">{account.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out" className="text-muted-foreground">
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  )
}
