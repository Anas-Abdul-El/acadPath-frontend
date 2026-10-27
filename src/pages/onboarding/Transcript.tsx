import { useRef, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { LocalFilesNotice } from "@/components/onboarding/uploads/local-files-notice";
import { OnboardingPageHeader } from "@/components/onboarding/onboarding-page-header";
import { StepActions } from "@/components/onboarding/step-actions";
import { AcademicYearField } from "@/components/onboarding/transcript/academic-year-field";
import { NewStudentNotice } from "@/components/onboarding/transcript/new-student-notice";
import { UniversitySummary } from "@/components/onboarding/university-summary";
import { MultiFileUploader } from "@/components/onboarding/uploads/multi-file-uploader";
import type { AcademicYear } from "@/data/academic-years";
import { transcriptDocumentTypes } from "@/data/upload-guidance";
import { useUploadForm } from "@/hooks/use-upload-form";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { pluralize } from "@/lib/files/format";
import {
  academicYearSelected,
  selectAcademicYear,
  selectCatalog,
  selectTranscriptRequired,
  selectUniversity,
  selectUniversityDocsSubmitted,
  submitTranscript,
} from "@/store/slices/onboarding/onboarding-slice";
import { ROUTES } from "@/lib/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const ERROR_ID = "transcript-error";

export function TranscriptPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const university = useAppSelector(selectUniversity);
  const catalog = useAppSelector(selectCatalog);
  const universityDocsSubmitted = useAppSelector(selectUniversityDocsSubmitted);
  const academicYear = useAppSelector(selectAcademicYear);
  const transcriptRequired = useAppSelector(selectTranscriptRequired);
  const transcriptFiles = useUploadQueue("transcript");
  const { error, submit } = useUploadForm(
    transcriptFiles,
    "Add your transcript, curriculum, or portal screenshots to finish setup.",
  );
  const [yearError, setYearError] = useState<string>();
  const yearRef = useRef<HTMLSelectElement>(null);

  if (!university)
    return <Navigate to={ROUTES.onboarding.university} replace />;
  // Without public university information, the documents step has to come first.
  if (catalog?.status !== "available" && !universityDocsSubmitted)
    return <Navigate to={ROUTES.onboarding.universityDocuments} replace />;

  const fileCount = transcriptFiles.items.length;

  const finish = () => {
    dispatch(submitTranscript());
    navigate(ROUTES.onboarding.complete);
  };

  const onYearChange = (year: AcademicYear) => {
    dispatch(academicYearSelected(year));
    setYearError(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!academicYear) {
      event.preventDefault();
      setYearError("Select your current year at university.");
      yearRef.current?.focus();
      return;
    }
    // First-term students have no courses on record yet, so there's nothing to upload.
    if (!transcriptRequired) {
      event.preventDefault();
      finish();
      return;
    }
    return submit(finish)(event);
  };

  return (
    <form noValidate aria-labelledby="transcript-title" onSubmit={onSubmit}>
      <title>Year & transcript · AcadPath</title>
      <UniversitySummary university={university} />

      <div className="mt-6">
        <OnboardingPageHeader
          id="transcript-title"
          eyebrow="Step 4 · Year & transcript"
          title={
            transcriptRequired
              ? "Upload your transcript or curriculum"
              : "You're starting fresh"
          }
          description={
            <p>
              Tell us your year at university. If you've already taken courses,
              your transcript shows which ones you've completed, your grades,
              and what's left — so your plan starts from where you actually are.
            </p>
          }
        />
      </div>

      <div className="mt-10">
        <AcademicYearField
          value={academicYear}
          onChange={onYearChange}
          error={yearError}
          selectRef={yearRef}
        />
      </div>

      {transcriptRequired ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0 space-y-5">
            <div className="flex gap-3 rounded-xl border border-border bg-secondary/60 p-4 text-sm leading-relaxed">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-foreground">
                  These documents contain personal academic information
                </p>
                <p className="mt-1 text-muted-foreground">
                  Only upload your own records. Before uploading, you can cover
                  details AcadPath doesn't need, like your national ID or home
                  address.
                </p>
              </div>
            </div>

            <MultiFileUploader
              queue={transcriptFiles}
              label="Academic transcript files"
              hint="Upload several PDFs and screenshots together — for example, a transcript plus portal screenshots."
              error={error}
              errorId={ERROR_ID}
            />
            <LocalFilesNotice />
          </div>

          <aside
            aria-labelledby="transcript-types"
            className="lg:border-l lg:border-border lg:pl-6"
          >
            <h2
              id="transcript-types"
              className="font-mono text-xs tracking-wide text-foreground uppercase"
            >
              What you can upload
            </h2>
            <ul className="mt-4 space-y-5">
              {transcriptDocumentTypes.map(
                ({ icon: Icon, title, description }) => (
                  <li key={title} className="flex gap-3">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {title}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </aside>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl">
          <NewStudentNotice />
        </div>
      )}

      <div className="mt-10">
        <StepActions
          backTo={
            universityDocsSubmitted
              ? ROUTES.onboarding.universityDocuments
              : ROUTES.onboarding.university
          }
          backLabel={
            universityDocsSubmitted
              ? "University documents"
              : "University details"
          }
          continueLabel="Finish setup"
          status={
            transcriptRequired && fileCount > 0
              ? `${pluralize(fileCount, "file")} ready to include`
              : undefined
          }
        />
      </div>
    </form>
  );
}
