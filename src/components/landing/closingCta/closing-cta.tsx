import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { ROUTES, SECTION_IDS } from "@/lib/routes";

export function ClosingCta() {
  return (
    <section
      id={SECTION_IDS.getStarted}
      aria-labelledby="cta-title"
      className="py-20 md:py-28"
    >
      <Container>
        <div className="bg-ruled relative overflow-hidden rounded-2xl bg-surface-ink px-6 py-16 text-surface-ink-foreground sm:px-12 md:py-20 lg:px-16">
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-10 hidden w-px bg-highlight/40 sm:block lg:left-12"
          />
          <div className="relative max-w-2xl sm:pl-8 lg:pl-6">
            <p className="font-mono text-xs tracking-wide text-highlight uppercase">
              Your next semester starts here
            </p>
            <h2
              id="cta-title"
              className="mt-5 font-display text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl"
            >
              Start planning the semesters that get you to graduation.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-surface-ink-foreground/75">
              Add your record, explore your options, and leave with a plan you
              understand — before registration opens.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="inverse" size="xl">
                <Link to={ROUTES.signUp}>
                  Get Started
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="inverse-outline" size="xl">
                <Link to={ROUTES.signIn}>I already have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
