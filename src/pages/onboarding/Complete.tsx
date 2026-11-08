import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  ListChecks,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { errorMessage } from "@/api/errors";
import {
  useCompleteOnboarding,
  useCurrentUser,
  useDocuments,
  useUniversitySources,
} from "@/api/me";
import { FormAlert } from "@/components/shared/form-alert";
import { Button } from "@/components/ui/button";
import { academicYearLabel } from "@/data/academic-years";
import { formatBytes, pluralize } from "@/lib/files/format";
import { majorLabel } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";

export function CompletePage() {
  const navigate = useNavigate();
  const { user, profile, onboarding } = useCurrentUser();
  const complete = useCompleteOnboarding();
  const [completeError, setCompleteError] = useState<string | null>(null);
  const transcriptRequired = Boolean(onboarding?.transcriptRequired);
  const uploadedSources = Boolean(onboarding?.universityDocumentsUploaded);
  const documents = useDocuments("TRANSCRIPT");
  const sources = useUniversitySources(uploadedSources);

  // The route guard only opens this step once every earlier one is done.
  const university = profile?.university;
  const academicYear = profile?.yearOfStudy;
  if (!university || !academicYear) return null;

  const back = {
    to: ROUTES.onboarding.transcript,
    label: transcriptRequired ? "Edit year & transcript" : "Edit year of study",
  };

  const firstName = user.name.split(/\s+/)[0];
  const transcripts = documents.data ?? [];
  const transcriptSize = transcripts.reduce(
    (sum, doc) => sum + doc.fileSize,
    0,
  );

  const universityDocsSummary = uploadedSources
    ? sources.data
      ? `${pluralize(sources.data.length, "source")} on file`
      : "Uploaded"
    : "Not needed — we already had your catalog";

  const summary = [
    {
      term: "University",
      detail: `${university.name} · ${university.city}, ${university.country}`,
    },
    ...(profile?.major
      ? [{ term: "Major", detail: majorLabel(profile.major) }]
      : []),
    { term: "Year", detail: academicYearLabel(academicYear) },
    { term: "University documents", detail: universityDocsSummary },
    {
      term: "Academic transcript",
      detail: !transcriptRequired
        ? "Not needed — no completed courses yet"
        : documents.isPending
          ? "Loading…"
          : `${pluralize(transcripts.length, "file")} processed (${formatBytes(transcriptSize)})`,
    },
    ...(transcriptRequired
      ? []
      : [{ term: "Starting GPA", detail: "0.00 · 0 credits earned" }]),
  ];

  const goToDashboard = async () => {
    setCompleteError(null);
    try {
      await complete.mutateAsync();
      navigate(ROUTES.app.overview);
    } catch (err) {
      setCompleteError(errorMessage(err));
    }
  };

  return (
    <>
      <title>Setup complete · AcadPath</title>
      <div className="mx-auto max-w-2xl">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-6 font-mono text-xs tracking-wide text-primary uppercase">
          Setup complete
        </p>
        <h1 className="mt-3 font-display text-[2.375rem] leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl">
          You're all set, {firstName}.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          You&rsquo;ve finished every onboarding step. Here&rsquo;s what
          AcadPath is working with.
        </p>

        <dl className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {summary.map((row) => (
            <div
              key={row.term}
              className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4"
            >
              <dt className="text-sm text-muted-foreground">{row.term}</dt>
              <dd className="text-sm font-medium text-foreground">
                {row.detail}
              </dd>
            </div>
          ))}
        </dl>

        <section
          aria-labelledby="next-step-title"
          className="mt-6 rounded-xl border border-dashed border-primary/30 bg-secondary/50 p-5 sm:p-6"
        >
          <div className="flex items-center gap-2.5">
            <ListChecks className="size-5 text-primary" aria-hidden="true" />
            <h2
              id="next-step-title"
              className="text-base font-medium text-foreground"
            >
              Next: review your academic information
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {transcriptRequired
              ? "Your dashboard shows the courses, grades, and credits we extracted from your transcript. From there, generate a semester-by-semester plan through graduation."
              : "Since this is your first term, your plan starts from the beginning of your degree. Generate it from your dashboard to see every semester through graduation."}
          </p>
        </section>

        {completeError ? (
          <FormAlert message={completeError} className="mt-6" />
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            asChild
            variant="ghost"
            size="xl"
            className="text-muted-foreground sm:-ml-3"
          >
            <Link to={back.to}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              {back.label}
            </Link>
          </Button>
          <Button
            size="xl"
            onClick={goToDashboard}
            disabled={complete.isPending}
          >
            {complete.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Opening your dashboard…
              </>
            ) : (
              <>
                Go to your dashboard
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
