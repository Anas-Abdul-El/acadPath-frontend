import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import {
  Controller,
  useForm,
  useWatch,
  type ControllerRenderProps,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { applyFieldErrors, errorMessage } from "@/api/errors";
import { findCountry, useCountries } from "@/api/directory";
import { useCurrentUser, useSelectUniversity } from "@/api/me";
import type { UniversitySelectionDto } from "@/api/types";
import { FormField } from "@/components/shared/form-field";
import { CatalogFoundPanel } from "@/components/onboarding/university/catalog-found-panel";
import {
  CityField,
  CountryField,
  MajorField,
  UniversityNameField,
} from "@/components/onboarding/university/directory-fields";
import { OnboardingPageHeader } from "@/components/onboarding/onboarding-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import {
  universityStepSchema,
  type UniversityStepValues,
} from "@/schemas/university";
import { useAppDispatch } from "@/store/hooks";
import { queueReset } from "@/store/slices/uploads/uploads-slice";

type CheckState =
  | { status: "idle" }
  | { status: "available"; result: UniversitySelectionDto }
  | { status: "error"; message: string };

const FIELDS = ["name", "country", "city", "major"] as const;
type FieldName = (typeof FIELDS)[number];

export function UniversityPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile } = useCurrentUser();
  const selectUniversity = useSelectUniversity();
  const [check, setCheck] = useState<CheckState>({ status: "idle" });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UniversityStepValues>({
    resolver: zodResolver(universityStepSchema),
    mode: "onTouched",
    defaultValues: {
      name: profile?.university?.name ?? "",
      country: profile?.university?.country ?? "",
      city: profile?.university?.city ?? "",
      major: profile?.major?.name ?? "",
    },
  });

  /** Any edit invalidates a previous check result. */
  const resetCheck = () =>
    setCheck((current) =>
      current.status === "idle" ? current : { status: "idle" },
    );

  const onSubmit = async (values: UniversityStepValues) => {
    setCheck({ status: "idle" });
    try {
      const result = await selectUniversity.mutateAsync(values);
      // Documents picked for another university don't describe this one.
      if (result.replaced) dispatch(queueReset("universityDocuments"));
      if (result.catalog.status === "AVAILABLE")
        setCheck({ status: "available", result });
      else navigate(ROUTES.onboarding.universityDocuments);
    } catch (err) {
      if (!applyFieldErrors(err, setError, FIELDS))
        setCheck({ status: "error", message: errorMessage(err) });
    }
  };

  const universityName = useWatch({ control, name: "name" }).trim();
  const countryName = useWatch({ control, name: "country" });
  const countries = useCountries();
  const country = findCountry(countries.data, countryName);

  /** Sets a field from a picked suggestion, as if the student had typed it. */
  const setField = (name: FieldName, value: string) => {
    setValue(name, value, { shouldDirty: true, shouldValidate: true });
    resetCheck();
  };

  const fieldBinding = (
    field: ControllerRenderProps<UniversityStepValues, FieldName>,
  ) => ({
    name: field.name,
    value: field.value,
    onValueChange: (value: string) => {
      field.onChange(value);
      resetCheck();
    },
    onBlur: field.onBlur,
    inputRef: field.ref,
  });

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

              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <FormField
                    label="Country"
                    description="Start here — we'll suggest universities and cities in it."
                    error={errors.country?.message}
                  >
                    {(aria) => (
                      <CountryField
                        {...aria}
                        {...fieldBinding(field)}
                        onSelectCountry={(selected) => {
                          // A city picked for another country no longer applies.
                          if (selected.code !== country?.code && getValues("city"))
                            setValue("city", "");
                          setField("country", selected.name);
                        }}
                      />
                    )}
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <FormField
                    label="University name"
                    description="Use the official name as it appears on your transcript."
                    error={errors.name?.message}
                  >
                    {(aria) => (
                      <UniversityNameField
                        {...aria}
                        {...fieldBinding(field)}
                        country={country}
                        onSelectUniversity={(university) => {
                          setField("name", university.name);
                          // Searching worldwide: fill in the country the university is in.
                          const match = countries.data?.find(
                            (c) => c.code === university.countryCode,
                          );
                          if (!country && match) setField("country", match.name);
                        }}
                      />
                    )}
                  </FormField>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormField label="City" error={errors.city?.message}>
                      {(aria) => (
                        <CityField
                          {...aria}
                          {...fieldBinding(field)}
                          country={country}
                        />
                      )}
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name="major"
                  render={({ field }) => (
                    <FormField
                      label="Major"
                      description="Your declared or intended major."
                      error={errors.major?.message}
                    >
                      {(aria) => (
                        <MajorField {...aria} {...fieldBinding(field)} />
                      )}
                    </FormField>
                  )}
                />
              </div>
            </fieldset>

            {check.status !== "available" ? (
              <div className="mt-7 flex flex-col-reverse items-stretch gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  We&rsquo;ll check whether we already have its course catalog.
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
                Looking for {universityName}&rsquo;s course catalog…
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
                <AlertDescription>{check.message}</AlertDescription>
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
