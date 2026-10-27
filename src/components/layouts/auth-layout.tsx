import { ArrowLeft } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

import { Logo } from "@/components/shared/logo"
import { onboardingSteps } from "@/data/onboarding"
import { ROUTES } from "@/lib/routes"

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="flex flex-col px-4 sm:px-8 lg:px-12">
        <header className="flex h-16 items-center justify-between gap-4">
          <Logo />
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </header>

        <main id="main" className="flex flex-1 items-start justify-center py-10 sm:items-center sm:py-14">
          <div className="w-full max-w-[25rem]">
            <Outlet />
          </div>
        </main>

        <footer className="py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AcadPath
        </footer>
      </div>

      <aside
        aria-label="What setup involves"
        className="bg-ruled relative hidden overflow-hidden bg-surface-ink text-surface-ink-foreground lg:flex lg:flex-col lg:justify-center"
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-12 w-px bg-highlight/40" />
        <div className="relative max-w-md px-20 py-16">
          <p className="font-mono text-xs tracking-wide text-highlight uppercase">Setup takes about five minutes</p>
          <h2 className="mt-5 font-display text-4xl leading-[1.1] tracking-tight text-balance">
            A plan built on your actual degree, not a generic template.
          </h2>
          <ol className="mt-10 space-y-6">
            {onboardingSteps.map((step, index) => (
              <li key={step.id} className="grid grid-cols-[2rem_1fr] gap-x-3">
                <span className="font-mono text-sm text-highlight font-tabular">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-medium">{step.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-surface-ink-foreground/70">
                    {step.summary}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  )
}
