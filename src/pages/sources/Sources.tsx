import { useState } from "react"

import { AppPageHeader } from "@/components/shared/page-header"
import { FocusCourseGroup } from "@/components/webApp/sources/focus-course-group"
import { ResourceDialog } from "@/components/webApp/sources/resource-dialog"
import { ResourceSearch } from "@/components/webApp/sources/resource-search"
import { NothingToShow, Subsection } from "@/components/webApp/sources/subsection"
import type { LearningResource } from "@/mock/sources/resources"
import { difficultFocusCourses, failedFocusCourses } from "@/lib/sources/recommendations"

const failed = failedFocusCourses()
const difficult = difficultFocusCourses()

export function SourcesPage() {
  const [open, setOpen] = useState<LearningResource | null>(null)

  return (
    <div className="space-y-10">
      <title>Sources · AcadPath</title>
      <AppPageHeader
        title="Sources"
        description="Learning resources from YouTube, Udemy, and Coursera — picked for the courses you've found hardest, or found on demand for any topic."
        actions={
          <nav aria-label="On this page" className="flex gap-2 text-sm">
            <a href="#recommended" className="rounded-md border border-border bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
              Recommended
            </a>
            <a href="#find" className="rounded-md border border-border bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
              Find sources
            </a>
          </nav>
        }
      />

      <section id="recommended" aria-labelledby="recommended-title" className="space-y-6">
        <div>
          <h2 id="recommended-title" className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Recommended for you
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Based only on the courses you've failed or are finding difficult.</p>
        </div>

        <Subsection title="Failed courses" description="Strengthen the foundations later courses build on.">
          {failed.length ? (
            failed.map((focus) => <FocusCourseGroup key={focus.course.code} focus={focus} onOpen={setOpen} />)
          ) : (
            <NothingToShow message="No failed courses on your record. If a course doesn't go to plan, resources for it will show up here." />
          )}
        </Subsection>

        <Subsection title="Courses you're finding difficult" description="Current courses where your standing is B+ or lower.">
          {difficult.length ? (
            difficult.map((focus) => <FocusCourseGroup key={focus.course.code} focus={focus} onOpen={setOpen} />)
          ) : (
            <NothingToShow message="All your current courses are going well — nothing flagged as difficult right now." />
          )}
        </Subsection>
      </section>

      <section id="find" aria-labelledby="find-title" className="space-y-5 border-t border-border pt-10">
        <div>
          <h2 id="find-title" className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Find learning sources
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Search for any course or topic you want to study.</p>
        </div>
        <ResourceSearch onOpen={setOpen} />
      </section>

      <ResourceDialog resource={open} onOpenChange={(isOpen) => !isOpen && setOpen(null)} />
    </div>
  )
}
