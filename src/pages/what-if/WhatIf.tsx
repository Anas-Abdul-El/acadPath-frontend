import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type KeyboardEvent,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CornerDownLeft,
  GitBranch,
  Loader2,
  MessageSquareDashed,
} from "lucide-react";
import { useForm } from "react-hook-form";

import { useMyCourses } from "@/api/academics";
import { errorMessage, isCancelled } from "@/api/errors";
import type { MyCourseDto } from "@/api/types";
import { analyzeScenario } from "@/api/what-if";
import { AppPageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScenarioLoading } from "@/components/webApp/whatIf/scenario-loading";
import { ScenarioResult } from "@/components/webApp/whatIf/scenario-result";
import { scenarioSchema, type ScenarioValues } from "@/schemas/scenario";
import type { ScenarioResult as ScenarioResultData } from "@/types/what-if";

const GENERIC_EXAMPLES = [
  "What if I take an additional course next semester?",
  "What if I take a lighter load next semester?",
];

/** Example scenarios built from the student's own courses, so every one of them is answerable. */
function buildExamples(courses: MyCourseDto[]): string[] {
  const first = (status: MyCourseDto["status"]) =>
    courses.find((course) => course.status === status);
  const inProgress = first("IN_PROGRESS");
  const completed = courses.find(
    (course) =>
      course.status === "COMPLETED" &&
      course.statusDetail.grade !== null &&
      course.statusDetail.grade !== "A",
  );
  const planned = courses.filter((course) => course.status === "PLANNED");
  const notTaken = first("NOT_TAKEN");

  const examples = [
    inProgress && `What if I fail ${inProgress.code} this semester?`,
    completed && `What if I retake ${completed.code} and get an A?`,
    planned[0] &&
      notTaken &&
      `What if I take ${notTaken.code} instead of ${planned[0].code}?`,
    notTaken && `What if I take ${notTaken.code} next semester?`,
    planned.at(-1) && `What if I drop ${planned.at(-1)?.code}?`,
  ].filter((example): example is string => Boolean(example));

  return [...examples, ...GENERIC_EXAMPLES].slice(0, 5);
}

type State =
  | { status: "idle" }
  | { status: "loading"; scenario: string }
  | { status: "done"; scenario: string; result: ScenarioResultData }
  | { status: "error"; scenario: string; message: string };

export function WhatIfPage() {
  const [state, setState] = useState<State>({ status: "idle" });
  const courses = useMyCourses();
  const examples = useMemo(
    () => buildExamples(courses.data ?? []),
    [courses.data],
  );
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ScenarioValues>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: { scenario: "" },
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = async ({ scenario }: ScenarioValues) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: "loading", scenario });
    try {
      const result = await analyzeScenario(scenario, controller.signal);
      setState({ status: "done", scenario, result });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (err) {
      if (!controller.signal.aborted && !isCancelled(err))
        setState({ status: "error", scenario, message: errorMessage(err) });
    }
  };

  // Wrapped so `run` (which touches a ref) is only read when the form is submitted.
  const submit = (event?: BaseSyntheticEvent) => handleSubmit(run)(event);

  const runExample = (example: string) => {
    setValue("scenario", example, { shouldValidate: true });
    void submit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  };

  const loading = state.status === "loading";
  const scenarioField = register("scenario");

  return (
    <div className="space-y-6">
      <title>What-If Analysis · AcadPath</title>
      <AppPageHeader
        title="What-If Analysis"
        description="Describe a change in plain language — failing, retaking, adding, or swapping a course — and see how it would affect your GPA, credits, plan, and graduation date."
      />

      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="rounded-lg border border-border bg-card p-4 sm:p-5"
      >
        <label
          htmlFor="scenario"
          className="text-sm font-medium text-foreground"
        >
          Your scenario
        </label>
        <Textarea
          id="scenario"
          {...scenarioField}
          onKeyDown={onKeyDown}
          rows={3}
          placeholder="What if I fail CS 3110 this semester?"
          aria-invalid={Boolean(errors.scenario)}
          aria-describedby={
            errors.scenario ? "scenario-error" : "scenario-hint"
          }
          className="mt-2 min-h-24 resize-none text-[0.9375rem]"
        />
        {errors.scenario ? (
          <p id="scenario-error" className="mt-2 text-sm text-destructive">
            {errors.scenario.message}
          </p>
        ) : (
          <p id="scenario-hint" className="mt-2 text-xs text-muted-foreground">
            Mention a course by code or name. Press Ctrl + Enter to analyze.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Try an example</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => runExample(example)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Button
            type="submit"
            size="xl"
            disabled={loading}
            className="shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Analyzing…
              </>
            ) : (
              <>
                Analyze scenario
                <CornerDownLeft data-icon="inline-end" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        aria-busy={loading}
        className="outline-none"
      >
        {state.status === "idle" ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <GitBranch
              aria-hidden="true"
              className="size-8 text-muted-foreground"
            />
            <p className="mt-3 font-medium text-foreground">No scenario yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Results compare your current plan with the scenario: GPA, credits,
              semester-by-semester changes, and your expected graduation date.
            </p>
          </div>
        ) : null}

        {loading ? <ScenarioLoading scenario={state.scenario} /> : null}

        {state.status === "error" ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            The analysis didn&rsquo;t finish. {state.message}
          </p>
        ) : null}

        {state.status === "done" ? (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Scenario:{" "}
              <span className="text-foreground">“{state.scenario}”</span>
            </p>
            {state.result.status === "ok" ? (
              <ScenarioResult analysis={state.result} />
            ) : (
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex gap-3">
                  <MessageSquareDashed
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {state.result.message}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Try one of these instead:
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {state.result.suggestions.map((suggestion) => (
                        <li key={suggestion}>
                          <button
                            type="button"
                            onClick={() => runExample(suggestion)}
                            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
                          >
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
