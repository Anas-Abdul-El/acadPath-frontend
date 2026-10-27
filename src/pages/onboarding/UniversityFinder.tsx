import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { FormField } from "@/components/shared/form-field";
import { CatalogFoundPanel } from "@/components/onboarding/university/catalog-found-panel";
import { OnboardingPageHeader } from "@/components/onboarding/onboarding-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  saveUniversity,
  selectCatalog,
  selectUniversity,
} from "@/store/slices/onboarding/onboarding-slice";
import {
  checkCatalogAvailability,
  type CatalogCheckResult,
} from "@/simulation/onboarding/university-catalog";
import { ROUTES } from "@/lib/routes";
import {
  universityStepSchema,
  type UniversityStepValues,
} from "@/schemas/university";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type CheckState =
  | { status: "idle" }
  | {
      status: "available";
      result: Extract<CatalogCheckResult, { status: "available" }>;
    }
  | { status: "error" };

export function UniversityPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectUniversity);
  const catalog = useAppSelector(selectCatalog);
  const abortRef = useRef<AbortController | null>(null);

  const [check, setCheck] = useState<CheckState>(() =>
    catalog?.status === "available"
      ? { status: "available", result: catalog }
      : { status: "idle" },
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UniversityStepValues>({
    resolver: zodResolver(universityStepSchema),
    mode: "onTouched",
    defaultValues: { name: "", country: "", city: "", major: "", ...saved },
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  /** Any edit invalidates a previous check result. */
  const resetCheck = () =>
    setCheck((current) =>
      current.status === "idle" ? current : { status: "idle" },
    );

  const onSubmit = async (values: UniversityStepValues) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await checkCatalogAvailability(values, controller.signal);
      dispatch(saveUniversity(values, result));
      if (result.status === "available")
        setCheck({ status: "available", result });
      else navigate(ROUTES.onboarding.universityDocuments);
    } catch {
      if (!controller.signal.aborted) setCheck({ status: "error" });
    }
  };

  const universityName = useWatch({ control, name: "name" }).trim();

  return (
    <>
      <title>Find your university · AcadPath</title>
      <OnboardingPageHeader
        eyebrow="Step 2 · University"
        title="Which university do you attend?"
        description="We'll look for your university's public course catalog so your plan uses its real courses, credit hours, and prerequisites."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="space-y-6">
          <form
            noValidate
            onSubmit={(event) => handleSubmit(onSubmit)(event)}
            className="rounded-xl border border-border bg-card p-5 sm:p-7"
          >
            <fieldset disabled={isSubmitting} className="space-y-5">
              <legend className="sr-only">University details</legend>

              <FormField
                label="University name"
                description="Use the official name as it appears on your transcript."
                error={errors.name?.message}
              >
                {(control) => (
                  <Input
                    {...control}
                    {...register("name", { onChange: resetCheck })}
                    autoComplete="organization"
                    placeholder="e.g. University of Jordan"
                    className="h-10"
                  />
                )}
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Country" error={errors.country?.message}>
                  {(control) => (
                    <Input
                      {...control}
                      {...register("country", { onChange: resetCheck })}
                      autoComplete="country-name"
                      placeholder="e.g. Jordan"
                      className="h-10"
                    />
                  )}
                </FormField>

                <FormField label="City" error={errors.city?.message}>
                  {(control) => (
                    <Input
                      {...control}
                      {...register("city", { onChange: resetCheck })}
                      autoComplete="address-level2"
                      placeholder="e.g. Amman"
                      className="h-10"
                    />
                  )}
                </FormField>
              </div>

              <FormField
                label="Major"
                description="Your declared or intended major."
                error={errors.major?.message}
              >
                {(control) => (
                  <Input
                    {...control}
                    {...register("major", { onChange: resetCheck })}
                    autoComplete="off"
                    placeholder="e.g. Computer Science"
                    className="h-10"
                  />
                )}
              </FormField>
            </fieldset>

            {check.status !== "available" ? (
              <div className="mt-7 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Simulated check — results come from sample data.
                </p>
                <Button type="submit" size="xl" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Checking…
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight data-icon="inline-end" />
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </form>

          <div aria-live="polite">
            {isSubmitting ? (
              <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Looking for {universityName}'s public course catalog…
              </p>
            ) : null}

            {check.status === "available" ? (
              <CatalogFoundPanel
                result={check.result}
                continueLabel="Continue to year & transcript"
                onContinue={() => navigate(ROUTES.onboarding.transcript)}
                onUploadAnyway={() =>
                  navigate(ROUTES.onboarding.universityDocuments)
                }
              />
            ) : null}

            {check.status === "error" ? (
              <Alert variant="destructive">
                <RotateCcw aria-hidden="true" />
                <AlertTitle>
                  We couldn't finish checking your university
                </AlertTitle>
                <AlertDescription>
                  Check your connection and press Continue to try again.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 text-sm leading-relaxed text-muted-foreground lg:border-l lg:border-border lg:pl-6">
          <h2 className="font-mono text-xs tracking-wide text-foreground uppercase">
            What we look for
          </h2>
          <ul className="space-y-2.5">
            {[
              "Course codes and titles",
              "Credit hours",
              "Prerequisites",
              "Degree requirements",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1 shrink-0 rounded-full bg-highlight"
                />
                {item}
              </li>
            ))}
          </ul>
          <p>
            If your university doesn't publish this, you can upload it yourself
            in the next step.
          </p>
        </aside>
      </div>
    </>
  );
}
