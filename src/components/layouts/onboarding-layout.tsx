import { LogOut } from "lucide-react"
import { Outlet, useLocation } from "react-router-dom"

import { useCurrentUser } from "@/api/me"
import { Logo } from "@/components/shared/logo"
import { Container } from "@/components/shared/container"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import { Button } from "@/components/ui/button"
import { useSignOut } from "@/hooks/use-sign-out"
import { initialsOf } from "@/lib/initials"

/** Setup shell with the step indicator. Guarded by `RequireAuth`. */
export function OnboardingLayout() {
  const { user: account } = useCurrentUser()
  const location = useLocation()
  const handleSignOut = useSignOut()

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-60 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="border-b border-border bg-background">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
              <p className="truncate text-xs text-muted-foreground">{account.email}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
            >
              {initialsOf(account.name)}
            </span>
            <Button variant="ghost" size="lg" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut data-icon="inline-start" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </Button>
          </div>
        </Container>
      </header>

      <div className="border-b border-border bg-background">
        <Container className="max-w-4xl py-5">
          <StepIndicator />
        </Container>
      </div>

      <main id="main" className="flex-1">
        <Container className="max-w-4xl py-10 sm:py-14">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </Container>
      </main>
    </div>
  )
}
