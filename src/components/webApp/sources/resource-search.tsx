import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Search, SearchX, TriangleAlert } from "lucide-react"
import { useForm } from "react-hook-form"

import { FormField } from "@/components/shared/form-field"
import { PlatformIcon } from "@/components/webApp/sources/platform"
import { ResourceCard } from "@/components/webApp/sources/resource-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PLATFORMS, type LearningResource, type Platform } from "@/mock/sources/resources"
import { pluralize } from "@/lib/files/format"
import { resourceSearchSchema, type ResourceSearchValues } from "@/schemas/sources"
import { searchResources, type SearchResult } from "@/simulation/sources/search"
import { cn } from "@/lib/utils"

const SUGGESTIONS = ["CS 3410", "Linear algebra", "SQL joins", "Hypothesis testing", "Machine learning"]

type State =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "done"; query: string; result: SearchResult }
  | { status: "error"; values: ResourceSearchValues }

export function ResourceSearch({ onOpen }: { onOpen: (resource: LearningResource) => void }) {
  const [state, setState] = useState<State>({ status: "idle" })
  const abortRef = useRef<AbortController | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResourceSearchValues>({
    resolver: zodResolver(resourceSearchSchema),
    defaultValues: { query: "", goal: "", platforms: ["youtube", "udemy", "coursera"] },
  })

  useEffect(() => () => abortRef.current?.abort(), [])

  const run = async (values: ResourceSearchValues) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setState({ status: "loading", query: values.query })
    try {
      const result = await searchResources(values, controller.signal)
      setState({ status: "done", query: values.query, result })
    } catch {
      if (!controller.signal.aborted) setState({ status: "error", values })
    }
  }

  // Wrapped so `run` (which touches a ref) is only read on submit.
  const submit = (event?: BaseSyntheticEvent) => handleSubmit(run)(event)

  const trySuggestion = (query: string) => {
    setValue("query", query, { shouldValidate: true })
    void submit()
  }

  const loading = state.status === "loading"

  return (
    <div className="space-y-6">
      <form noValidate onSubmit={(event) => void submit(event)} className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <FormField label="Course or topic" error={errors.query?.message} description="A course name, a code like CS 3110, or a topic.">
            {(control) => (
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input {...control} {...register("query")} type="search" className="h-10 pl-9" placeholder="e.g. Operating Systems" autoComplete="off" />
              </div>
            )}
          </FormField>
          <FormField label="What do you want to learn?" error={errors.goal?.message} description="Optional — helps narrow the results.">
            {(control) => (
              <Textarea
                {...control}
                {...register("goal")}
                rows={1}
                className="min-h-10 resize-none"
                placeholder="e.g. I keep getting stuck on dynamic programming"
              />
            )}
          </FormField>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-foreground">Platforms</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(PLATFORMS) as Platform[]).map((platform) => (
              <label
                key={platform}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40"
              >
                <input type="checkbox" value={platform} {...register("platforms")} className="size-3.5 accent-[var(--primary)]" />
                <PlatformIcon platform={platform} className="size-3.5 text-muted-foreground" />
                {PLATFORMS[platform].label}
              </label>
            ))}
          </div>
          {errors.platforms ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {errors.platforms.message}
            </p>
          ) : null}
        </fieldset>

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Prototype: searches AcadPath's sample resource list, not the live platforms.</p>
          <Button type="submit" size="xl" disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Searching…
              </>
            ) : (
              <>
                <Search data-icon="inline-start" aria-hidden="true" />
                Find sources
              </>
            )}
          </Button>
        </div>
      </form>

      <div aria-live="polite" aria-busy={loading}>
        {state.status === "idle" ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-10 text-center">
            <Search aria-hidden="true" className="size-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">Search for any course or topic</p>
            <p className="mt-1 text-sm text-muted-foreground">Try one of these:</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => trySuggestion(suggestion)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {state.status === "loading" ? (
          <div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Finding sources for “{state.query}”…
            </p>
            <div aria-hidden="true" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-80 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-destructive">
              <TriangleAlert aria-hidden="true" className="size-4" />
              The search didn't finish. Check your connection and try again.
            </p>
            <Button variant="outline" size="lg" onClick={() => void run(state.values)}>
              Try again
            </Button>
          </div>
        ) : null}

        {state.status === "done" ? (
          state.result.results.length ? (
            <div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{pluralize(state.result.results.length, "source")}</span> for “{state.query}”
                {state.result.matchedCourse ? (
                  <>
                    {" "}
                    · matched <span className="font-mono text-xs">{state.result.matchedCourse.code}</span> {state.result.matchedCourse.title}
                  </>
                ) : null}
              </p>
              <ul className={cn("mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3")}>
                {state.result.results.map((resource) => (
                  <li key={resource.id} className="flex [&>article]:w-full">
                    <ResourceCard resource={resource} onOpen={onOpen} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-10 text-center">
              <SearchX aria-hidden="true" className="size-7 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">No sources found for “{state.query}”</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Try a broader topic, a course code like CS 3110, or include more platforms.
              </p>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
