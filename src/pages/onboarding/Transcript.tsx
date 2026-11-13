import { useRef, useState, type FormEvent } from "react";
import { Globe, ShieldCheck, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { errorMessage } from "@/api/errors";
import { useCurrentUser, useUpdateProfile, useUploadDocuments } from "@/api/me";
import { FormAlert } from "@/components/shared/form-alert";
import { LocalFilesNotice } from "@/components/onboarding/uploads/local-files-notice";
import { OnboardingPageHeader } from "@/components/onboarding/onboarding-page-header";
import { StepActions } from "@/components/onboarding/step-actions";
import { AcademicYearField } from "@/components/onboarding/transcript/academic-year-field";
import { NewStudentNotice } from "@/components/onboarding/transcript/new-student-notice";
import { PortalConnect } from "@/components/onboarding/transcript/portal-connect";
import {
  TranscriptMethodPicker,
  type TranscriptMethod,
} from "@/components/onboarding/transcript/transcript-method-picker";
import { UniversitySummary } from "@/components/onboarding/university-summary";
import { MultiFileUploader } from "@/components/onboarding/uploads/multi-file-uploader";
import { NEW_STUDENT_YEAR, type AcademicYear } from "@/data/academic-years";
import { transcriptDocumentTypes } from "@/data/upload-guidance";
import { useUploadForm } from "@/hooks/use-upload-form";
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { pluralize } from "@/lib/files/format";
import { ROUTES } from "@/lib/routes";

const ERROR_ID = "transcript-error";

export function TranscriptPage() {
  const navigate = useNavigate();
  const { profile, onboarding } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const uploadDocuments = useUploadDocuments();
  const progress = useUploadProgress("Reading your transcript…");
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(
    profile?.yearOfStudy ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Importing from the student portal is the default; uploading files is the fallback.
  const [method, setMethod] = useState<TranscriptMethod>("portal");
  const transcriptFiles = useUploadQueue("transcript");
  const { error, submit } = useUploadForm(
    transcriptFiles,
    "Add your transcript, curriculum, or portal screenshots to finish setup.",
  );
  const [yearError, setYearError] = useState<string>();
  const yearRef = useRef<HTMLSelectElement>(null);

  // The route guard only opens this step once a university is saved.
  const university = profile?.university;
  if (!university) return null;

  const transcriptRequired = academicYear !== NEW_STUDENT_YEAR;
  const alreadyUploaded = Boolean(onboarding?.transcriptUploaded);
  const fileCount = transcriptFiles.items.length;
  const uploadedDocs = Boolean(onboarding?.universityDocumentsUploaded);

  const onYearChange = (year: AcademicYear) => {
    setAcademicYear(year);
    setYearError(undefined);
  };

  /** Saves the year, then uploads the transcript when one is needed. */
  const finish = async () => {
    if (!academicYear) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (profile?.yearOfStudy !== academicYear)
        await updateProfile.mutateAsync({ yearOfStudy: academicYear });
      if (transcriptRequired && method === "upload" && fileCount > 0) {
        progress.start();
        await uploadDocuments.mutateAsync({
          files: transcriptFiles.items.map((item) => item.file),
          onProgress: progress.onProgress,
        });
        transcriptFiles.reset();
      }
      navigate(ROUTES.onboarding.complete);
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      progress.stop();
      setSubmitting(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!academicYear) {
      event.preventDefault();
      setYearError("Select your current year at university.");
      yearRef.current?.focus();
      return;
    }
    // First-term students have no courses on record yet, so there's nothing to upload. A student
    // coming back after uploading can continue without adding files again.
    if (transcriptRequired && method === "portal") {
      event.preventDefault();
      if (!alreadyUploaded) {
        setSubmitError(
          "Import your transcript from the student portal first, or switch to uploading files.",
        );
        return;
      }
      void finish();
      return;
    }
    if (!transcriptRequired || (alreadyUploaded && fileCount === 0)) {
      event.preventDefault();
      void finish();
      return;
    }
    return submit(finish)(event);
  };

  const pendingLabel = submitting ? (progress.label ?? "Saving…") : null;

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
              ? method === "portal"
                ? "Import your transcript"
                : "Upload your transcript or curriculum"
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
        <div className="mt-8">
          <TranscriptMethodPicker
            value={method}
            onChange={(next) => {
              setMethod(next);
              setSubmitError(null);
            }}
            options={[
              {
                value: "portal",
                icon: Globe,
                label: "Student portal",
                description: "Sign in and we read your transcript page",
              },
              {
                value: "upload",
                icon: Upload,
                label: "Upload files",
                description: "PDFs or screenshots of your transcript",
              },
            ]}
            disabled={submitting}
          />
        </div>
      ) : null}

      {transcriptRequired && method === "portal" ? (
        <div className="mt-6">
          <PortalConnect
            universityName={university.name}
            alreadyImported={alreadyUploaded}
            disabled={submitting}
            onImported={() => setSubmitError(null)}
          />
        </div>
      ) : transcriptRequired ? (
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
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
              disabled={submitting}
            />
            {alreadyUploaded && fileCount === 0 ? (
              <p className="text-sm text-muted-foreground">
                Your transcript is already on file. Add files only if you want
                to replace the courses we extracted.
              </p>
            ) : null}
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

      {submitError ? (
        <FormAlert
          title="We couldn't finish this step"
          message={submitError}
          className="mt-8"
        />
      ) : null}

      <div className="mt-10">
        <StepActions
          backTo={
            uploadedDocs
              ? ROUTES.onboarding.universityDocuments
              : ROUTES.onboarding.university
          }
          backLabel={
            uploadedDocs ? "University documents" : "University details"
          }
          continueLabel="Finish setup"
          pendingLabel={pendingLabel}
          status={
            transcriptRequired && method === "upload" && fileCount > 0
              ? `${pluralize(fileCount, "file")} ready to include`
              : undefined
          }
        />
      </div>
    </form>
  );
}
