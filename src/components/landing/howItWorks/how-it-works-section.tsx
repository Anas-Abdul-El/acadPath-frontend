import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { steps } from "@/data/landing";
import { SECTION_IDS } from "@/lib/routes";

export function HowItWorksSection() {
  return (
    <section
      id={SECTION_IDS.howItWorks}
      aria-labelledby="how-it-works-title"
      className="border-t border-border py-24 md:py-32"
    >
      <Container>
        <div>
          <SectionHeading
            id="how-it-works-title"
            index="02"
            eyebrow="How it works"
            title={
              <>
                From transcript to graduation plan{" "}
                <em className="text-primary">in three steps.</em>
              </>
            }
            description="Set up once, then come back each term to adjust as grades come in and new courses open."
          />
        </div>

        <div className=" list-none relative mt-16 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="relative">
                <div className="flex items-center gap-4 md:flex-col md:items-start">
                  <span className="relative z-10 grid size-12 place-items-center rounded-full border border-border bg-background text-primary shadow-[0_0_0_6px_var(--background)]">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-display text-5xl leading-none text-border md:mt-6 md:text-6xl"
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-pretty text-muted-foreground">
                  {step.description}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border pt-5">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-center gap-2.5 text-sm text-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-primary"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
