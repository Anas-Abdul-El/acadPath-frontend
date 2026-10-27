import { FlaskConical, LogOut } from "lucide-react"
import { Link } from "react-router-dom"

import { SidebarNav } from "@/components/layouts/sidebar-nav"
import { LogoMark } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { adminNavigation } from "@/data/admin-navigation"
import { ROUTES } from "@/lib/routes"

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
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
        <p className="flex gap-2 rounded-lg border border-surface-ink-foreground/15 p-3 text-[11px] leading-relaxed text-surface-ink-foreground/70">
          <FlaskConical aria-hidden="true" className="mt-px size-3.5 shrink-0 text-highlight" />
          Prototype console. Changes are kept in this browser tab only and reset when you refresh.
        </p>
        <Button
          asChild
          variant="ghost"
          size="lg"
          className="w-full justify-start text-surface-ink-foreground/70 hover:bg-surface-ink-foreground/8 hover:text-surface-ink-foreground"
        >
          <Link to={ROUTES.home}>
            <LogOut data-icon="inline-start" aria-hidden="true" />
            Exit admin
          </Link>
        </Button>
      </div>
    </div>
  )
}
