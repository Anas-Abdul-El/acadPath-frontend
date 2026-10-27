import { ArrowUpRight } from "lucide-react"

import { Container } from "@/components/shared/container"
import { FeatureVignette } from "@/components/landing/features/feature-vignettes"
import { SectionHeading } from "@/components/landing/section-heading"
import { features } from "@/data/landing"
import { SECTION_IDS } from "@/lib/routes"

export function FeaturesSection() {
  return (
    <section
      id={SECTION_IDS.features}
      aria-labelledby="features-title"
      className="border-t border-border bg-card/60 py-24 md:py-32"
    >
      <Container>
        <div>
          <SectionHeading
            id="features-title"
            index="01"
            eyebrow="Features"
            title={
              <>
                Everything a semester decision depends on,{" "}
                <em className="text-primary">in one place.</em>
              </>
            }
            description="AcadPath connects your record, your degree requirements, and your study materials, so planning stops being a spreadsheet and a guess."
          />
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:mt-16 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <li
                key={feature.id}
                className="group flex flex-col bg-background p-6 transition-colors duration-300 hover:bg-card sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md border border-border bg-card text-primary transition-colors group-hover:border-primary/30 group-hover:bg-secondary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-pretty text-muted-foreground">
                  {feature.description}
                </p>
                <p className="mt-4 flex items-start gap-2 text-sm font-medium text-foreground">
                  <ArrowUpRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  {feature.benefit}
                </p>

                <div className="mt-7 pt-1 md:mt-auto md:pt-8">
                  <FeatureVignette id={feature.id} />
                </div>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
