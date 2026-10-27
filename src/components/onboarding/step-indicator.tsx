import { Check, Minus } from "lucide-react";
import { useLocation } from "react-router-dom";

import { onboardingSteps, type OnboardingStepId } from "@/data/onboarding";
import {
  selectTranscriptRequired,
  selectUniversityDocsSubmitted,
} from "@/store/slices/onboarding/onboarding-slice";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

type StepState = "complete" | "current" | "upcoming" | "skipped";

const STEP_BY_PATH: Record<string, OnboardingStepId | "done"> = {
  [ROUTES.onboarding.university]: "university",
  [ROUTES.onboarding.universityDocuments]: "university-docs",
  [ROUTES.onboarding.transcript]: "transcript",
  [ROUTES.onboarding.complete]: "done",
};

const ORDER: (OnboardingStepId | "done")[] = [
  "account",
  "university",
  "university-docs",
  "transcript",
  "done",
];

const STATE_LABEL: Record<StepState, string> = {
  complete: "completed",
  current: "current step",
  upcoming: "not started",
  skipped: "not needed",
};

export function StepIndicator() {
  const { pathname } = useLocation();
  const universityDocsSubmitted = useAppSelector(selectUniversityDocsSubmitted);
  const transcriptRequired = useAppSelector(selectTranscriptRequired);
  const current = STEP_BY_PATH[pathname] ?? "university";
  const currentIndex = ORDER.indexOf(current);

  const stateOf = (id: OnboardingStepId): StepState => {
    const index = ORDER.indexOf(id);
    if (index === currentIndex) return "current";
    if (index > currentIndex) return "upcoming";
    if (id === "university-docs" && !universityDocsSubmitted) return "skipped";
    // The year is chosen on this step; first-term students finish it without an upload.
    if (id === "transcript" && !transcriptRequired) return "skipped";
    return "complete";
  };

  const position = Math.min(currentIndex + 1, onboardingSteps.length);
  const currentStep = onboardingSteps.find((step) => step.id === current);

  return (
    <nav aria-label="Setup progress">
      {/* Compact summary for small screens */}
      <div className="sm:hidden">
        <p className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-foreground">
            {currentStep ? currentStep.label : "Setup complete"}
          </span>
          <span className="font-mono text-xs text-muted-foreground font-tabular">
            {current === "done"
              ? "Done"
              : `Step ${position} of ${onboardingSteps.length}`}
          </span>
        </p>
        <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {onboardingSteps.map((step) => {
            const state = stateOf(step.id);
            return (
              <span
                key={step.id}
                className={cn(
                  "h-1 rounded-full",
                  state === "complete" && "bg-primary",
                  state === "current" && "bg-highlight",
                  state === "skipped" && "bg-primary/30",
                  state === "upcoming" && "bg-border",
                )}
              />
            );
          })}
        </div>
      </div>

      <ol className="hidden items-center sm:flex">
        {onboardingSteps.map((step, index) => {
          const state = stateOf(step.id);
          return (
            <li
              key={step.id}
              className="flex flex-1 items-center last:flex-none"
            >
              <div
                aria-current={state === "current" ? "step" : undefined}
                className="flex items-center gap-2.5"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-tabular",
                    state === "complete" &&
                      "border-primary bg-primary text-primary-foreground",
                    state === "current" &&
                      "border-primary bg-background text-primary ring-3 ring-primary/15",
                    state === "skipped" &&
                      "border-dashed border-muted-foreground/50 text-muted-foreground",
                    state === "upcoming" &&
                      "border-border text-muted-foreground",
                  )}
                >
                  {state === "complete" ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : state === "skipped" ? (
                    <Minus className="size-3.5" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm whitespace-nowrap",
                    state === "current"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {/* Full label for the current step only, so connectors never get squeezed */}
                  {state === "current" ? step.label : step.shortLabel}
                  <span className="sr-only">, {STATE_LABEL[state]}</span>
                  {state === "skipped" ? (
                    <span
                      aria-hidden="true"
                      className="ml-1.5 text-xs text-muted-foreground/80"
                    >
                      (not needed)
                    </span>
                  ) : null}
                </span>
              </div>
              {index < onboardingSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mx-3 h-px min-w-4 flex-1",
                    stateOf(onboardingSteps[index + 1].id) === "upcoming"
                      ? "bg-border"
                      : "bg-primary/40",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
