import { ArrowLeft, ArrowRight, CircleCheck, ListChecks } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { academicYearLabel } from "@/data/academic-years";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { formatBytes, pluralize } from "@/lib/files/format";
import {
  selectAcademicYear,
  selectAccount,
  selectCatalog,
  selectTranscriptRequired,
  selectTranscriptSubmitted,
  selectUniversity,
  selectUniversityDocsSubmitted,
} from "@/store/slices/onboarding/onboarding-slice";
import { ROUTES } from "@/lib/routes";
import { useAppSelector } from "@/store/hooks";

export function CompletePage() {
  const account = useAppSelector(selectAccount);
  const university = useAppSelector(selectUniversity);
  const catalog = useAppSelector(selectCatalog);
  const universityDocsSubmitted = useAppSelector(selectUniversityDocsSubmitted);
  const transcriptSubmitted = useAppSelector(selectTranscriptSubmitted);
  const academicYear = useAppSelector(selectAcademicYear);
  const transcriptRequired = useAppSelector(selectTranscriptRequired);
  const universityDocuments = useUploadQueue("universityDocuments");
  const transcriptFiles = useUploadQueue("transcript");

  if (!university || !account)
    return <Navigate to={ROUTES.onboarding.university} replace />;
  if (catalog?.status !== "available" && !universityDocsSubmitted)
    return <Navigate to={ROUTES.onboarding.universityDocuments} replace />;
  if (!transcriptSubmitted || !academicYear)
    return <Navigate to={ROUTES.onboarding.transcript} replace />;

  const back = {
    to: ROUTES.onboarding.transcript,
    label: transcriptRequired ? "Edit year & transcript" : "Edit year of study",
  };

  const firstName = account.name.split(/\s+/)[0];
  const universityDocsSummary =
    universityDocuments.items.length > 0
      ? `${pluralize(universityDocuments.items.length, "document")} added (${formatBytes(universityDocuments.totalSize)})`
      : catalog?.status === "available"
        ? `Public catalog — ${catalog.title}`
        : "Not provided";

  const summary = [
    {
      term: "University",
      detail: `${university.name} · ${university.city}, ${university.country}`,
    },
    { term: "Year", detail: academicYearLabel(academicYear) },
    { term: "University documents", detail: universityDocsSummary },
    {
      term: "Academic transcript",
      detail: transcriptRequired
        ? `${pluralize(transcriptFiles.items.length, "file")} added (${formatBytes(transcriptFiles.totalSize)})`
        : "Not needed — no completed courses yet",
    },
    ...(transcriptRequired
      ? []
      : [{ term: "Starting GPA", detail: "0.00 · 0 credits earned" }]),
  ];

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
          You've finished every onboarding step. Here's what you gave us to work
          with.
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
              ? "AcadPath will read your documents and show the courses, grades, credits, and remaining requirements it finds. You'll confirm or correct each item before your plan is built."
              : "Since this is your first term, your plan starts from the beginning of your degree. AcadPath will lay out your degree requirements so you can confirm them before your first semester is planned."}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Prototype:</span>{" "}
            document processing isn't connected yet, so your files haven't been
            uploaded or analyzed.
          </p>
        </section>

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
          <Button asChild size="xl">
            <Link to={ROUTES.app.overview}>
              Go to your dashboard
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
