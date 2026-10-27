import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Container } from "@/components/shared/container";
import { DashboardPreview } from "@/components/landing/preview/dashboard-preview";
import { Button } from "@/components/ui/button";
import { ROUTES, SECTION_IDS } from "@/lib/routes";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-grid-paper pointer-events-none absolute inset-x-0 top-0 h-176 mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />

      <Container className="relative pt-14 pb-20 sm:pt-20 md:pt-24 lg:pb-28">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-highlight"
            />
            Academic planning for university students
          </p>

          <h1
            id="hero-title"
            className="mt-6 font-display text-[2.75rem] leading-[1.02] font-normal tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
          >
            Your academic journey,{" "}
            <span className="relative inline-block italic">
              <span className="relative z-10 text-primary">
                planned smarter.
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.08em] h-[0.28em] -rotate-1 rounded-sm bg-highlight/55"
              />
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
            AcadPath maps your degree requirements to a semester-by-semester
            plan, shows how different course choices affect your GPA and
            graduation date, and finds learning resources for the courses that
            need more of your attention.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="xl">
              <Link to={ROUTES.signUp}>
                Get Started
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className="bg-background/70"
            >
              <a href={`#${SECTION_IDS.features}`}>
                Explore Features
                <ArrowDown data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <DashboardPreview />
        </div>
      </Container>
    </section>
  );
}
