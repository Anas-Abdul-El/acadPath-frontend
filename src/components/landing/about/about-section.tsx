import { Container } from "@/components/shared/container"
import { principles } from "@/data/landing"
import { SECTION_IDS } from "@/lib/routes"

export function AboutSection() {
  return (
    <section
      id={SECTION_IDS.about}
      aria-labelledby="about-title"
      className="border-t border-border bg-card/60 py-24 md:py-32"
    >
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            <span className="text-primary">03</span>
            <span aria-hidden="true" className="h-px w-6 bg-border" />
            About AcadPath
          </p>
          <h2
            id="about-title"
            className="mt-4 font-display text-4xl leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl"
          >
            Built around how universities <em className="text-primary">actually work.</em>
          </h2>
        </div>

        <div className="lg:col-span-7">
          <div>
            <blockquote className="border-l-2 border-highlight pl-6">
              <p className="font-display text-2xl leading-snug text-pretty text-foreground sm:text-[1.75rem]">
                Most students plan their degree with a PDF catalog, a spreadsheet, and a
                fifteen-minute advising slot. AcadPath turns that into a plan they can explore
                any time — and one advisors can check at a glance.
              </p>
            </blockquote>
          </div>

          <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {principles.map((principle) => {
              const Icon = principle.icon
              return (
                <li key={principle.title}>
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                  <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </section>
  )
}
