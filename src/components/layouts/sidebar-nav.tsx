import { NavLink } from "react-router-dom"

import type { AppNavItem } from "@/data/app-navigation"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  items: AppNavItem[]
  /** The section's index path, matched exactly so it isn't active on every child page. */
  rootPath: string
  label: string
  /** "dark" for the admin console's ink sidebar. */
  tone?: "light" | "dark"
  /** Called after a link is followed, e.g. to close the mobile drawer. */
  onNavigate?: () => void
}

export function SidebarNav({ items, rootPath, label, tone = "light", onNavigate }: SidebarNavProps) {
  const dark = tone === "dark"
  return (
    <nav aria-label={label}>
      <ul className="space-y-0.5">
        {items.map(({ label: itemLabel, to, icon: Icon }) => (
          <li key={itemLabel}>
            {to ? (
              <NavLink
                to={to}
                end={to === rootPath}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    dark
                      ? isActive
                        ? "bg-surface-ink-foreground/12 font-medium text-surface-ink-foreground"
                        : "text-surface-ink-foreground/65 hover:bg-surface-ink-foreground/8 hover:text-surface-ink-foreground"
                      : isActive
                        ? "bg-card font-medium text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05)]"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden="true"
                      className={cn("size-4", isActive && (dark ? "text-highlight" : "text-primary"))}
                    />
                    {itemLabel}
                  </>
                )}
              </NavLink>
            ) : (
              <span
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground/60"
              >
                <Icon aria-hidden="true" className="size-4" />
                {itemLabel}
                <span className="ml-auto rounded-full border border-border px-1.5 py-px text-[10px] tracking-wide uppercase">
                  Soon
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
