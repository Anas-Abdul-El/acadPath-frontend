import { LogOut } from "lucide-react"

import { useCurrentUser } from "@/api/me"
import { Logo } from "@/components/shared/logo"
import { SidebarNav } from "@/components/layouts/sidebar-nav"
import { Button } from "@/components/ui/button"
import { academicYearLabel } from "@/data/academic-years"
import { appNavigation } from "@/data/app-navigation"
import { initialsOf } from "@/lib/initials"
import { majorLabel } from "@/lib/labels"
import { ROUTES } from "@/lib/routes"

type AppSidebarProps = {
  onSignOut: () => void
  onNavigate?: () => void
}

export function AppSidebar({ onSignOut, onNavigate }: AppSidebarProps) {
  const { user, profile } = useCurrentUser()
  const university = profile?.university
  const major = profile?.major

  return (
    <div className="flex h-full flex-col p-3">
      <div className="px-2.5 py-2">
        <Logo />
      </div>

      <div className="mt-6">
        <SidebarNav items={appNavigation} rootPath={ROUTES.app.overview} label="App" onNavigate={onNavigate} />
      </div>

      <div className="mt-auto space-y-3">
        {major || university ? (
          <div className="rounded-lg border border-border bg-card p-3">
            {major ? <p className="text-xs font-medium text-foreground">{majorLabel(major)}</p> : null}
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {[university?.shortName ?? university?.name, profile?.yearOfStudy && academicYearLabel(profile.yearOfStudy)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        ) : null}

        <div className="flex items-center gap-2.5 px-1">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
          >
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out" className="text-muted-foreground">
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  )
}
