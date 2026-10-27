import { Link } from "react-router-dom"

import { Logo } from "@/components/shared/logo"
import { Container } from "@/components/shared/container"
import { footerGroups } from "@/data/landing"

const footerLinkClass =
  "text-sm text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <Container className="grid gap-12 py-14 md:grid-cols-12">
        <div className="md:col-span-6 lg:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            AI-powered academic planning for university students — semester plans, what-if
            analysis, course guidance, and learning resources in one place.
          </p>
        </div>

        {footerGroups.map((group) => (
          <nav
            key={group.title}
            aria-label={group.title}
            className="md:col-span-3 lg:col-span-2 lg:first-of-type:col-start-9"
          >
            <h2 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("#") ? (
                    <a href={link.href} className={footerLinkClass}>
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} AcadPath. All rights reserved.</p>
        <p>Made for students, advisors, and registrars.</p>
      </Container>
    </footer>
  )
}
