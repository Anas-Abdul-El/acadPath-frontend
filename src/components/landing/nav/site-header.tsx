import { useId, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { primaryNav } from "@/data/landing";
import { ROUTES } from "@/lib/routes";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="lg" className="px-3.5">
            <Link to={ROUTES.signIn}>Sign In</Link>
          </Button>
          <Button asChild size="lg" className="px-4">
            <Link to={ROUTES.signUp}>
              Get Started
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon-lg"
          className="md:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </Container>

      <div
        id={menuId}
        hidden={!menuOpen}
        className="border-t border-border bg-background md:hidden"
      >
        <Container className="py-4">
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="block border-b border-border/70 py-3 text-base text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="xl">
              <Link to={ROUTES.signIn}>Sign In</Link>
            </Button>
            <Button asChild size="xl">
              <Link to={ROUTES.signUp}>Get Started</Link>
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
