import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"

type LogoMarkProps = {
  className?: string
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      width={256}
      height={256}
      decoding="async"
      className={cn("size-8 shrink-0 object-contain", className)}
    />
  )
}

type LogoProps = {
  className?: string
  /** Render the wordmark on a dark surface. */
  inverse?: boolean
}

export function Logo({ className, inverse = false }: LogoProps) {
  return (
    <Link
      to={ROUTES.home}
      aria-label="AcadPath home"
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-[1.0625rem] font-semibold tracking-tight",
        inverse ? "text-surface-ink-foreground" : "text-surface-ink",
        className,
      )}
    >
      <LogoMark />
      <span>AcadPath</span>
    </Link>
  )
}
