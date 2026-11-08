import { useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { errorMessage } from "@/api/errors";
import { useCurrentUser, useUploadUniversitySources } from "@/api/me";
import { FormAlert } from "@/components/shared/form-alert";
import { LocalFilesNotice } from "@/components/onboarding/uploads/local-files-notice";
import { OnboardingPageHeader } from "@/components/onboarding/onboarding-page-header";
import { StepActions } from "@/components/onboarding/step-actions";
import { UniversitySummary } from "@/components/onboarding/university-summary";
import { MultiFileUploader } from "@/components/onboarding/uploads/multi-file-uploader";
import { universityDocumentTopics } from "@/data/upload-guidance";
import { useUploadForm } from "@/hooks/use-upload-form";
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { pluralize } from "@/lib/files/format";
import { ROUTES } from "@/lib/routes";

const ERROR_ID = "university-documents-error";

export function UniversityDocumentsPage() {
  const navigate = useNavigate();
  const { profile, onboarding } = useCurrentUser();
  const upload = useUploadUniversitySources();
  const progress = useUploadProgress("Extracting courses…");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const universityDocuments = useUploadQueue("universityDocuments");
  const { error, submit } = useUploadForm(
    universityDocuments,
    "Add at least one PDF or screenshot of your university's course information to continue.",
  );

  // The route guard only opens this step once a university is saved.
  const university = profile?.university;
  if (!university) return null;

  const catalogFound = onboarding?.catalogStatus === "AVAILABLE";
  const fileCount = universityDocuments.items.length;
  const majorName = profile?.major?.name;

  const onValid = async () => {
    setUploadError(null);
    progress.start();
    try {
      await upload.mutateAsync({
        files: universityDocuments.items.map((item) => item.file),
        onProgress: progress.onProgress,
      });
      universityDocuments.reset();
      navigate(ROUTES.onboarding.transcript);
    } catch (err) {
      setUploadError(errorMessage(err));
    } finally {
      progress.stop();
    }
  };

  return (
    <form
      noValidate
      aria-labelledby="university-documents-title"
      onSubmit={submit(onValid)}
    >
      <title>University documents · AcadPath</title>
      <UniversitySummary university={university} />

      <div className="mt-6">
        <OnboardingPageHeader
          id="university-documents-title"
          eyebrow="Step 3 · University documents"
          title="Upload your university's course information"
          description={
            catalogFound ? (
              <p>
                We already have {university.name}&rsquo;s catalog. Add documents
                for anything it may not cover, such as department program sheets
                or updated requirements.
              </p>
            ) : (
              <p>
                We couldn&rsquo;t find a course catalog for your university
                {majorName ? <> and {majorName}</> : null}. To build an accurate
                academic plan, upload your university&rsquo;s course information
                and we&rsquo;ll extract the courses from it.
              </p>
            )
          }
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-5">
          <MultiFileUploader
            queue={universityDocuments}
            label="University document files"
            hint="Upload several PDFs and screenshots together — catalog pages, program sheets, or study plans."
            error={error}
            errorId={ERROR_ID}
            disabled={upload.isPending}
          />
          {uploadError ? (
            <FormAlert
              title="We couldn't use these files"
              message={uploadError}
            />
          ) : null}
          <LocalFilesNotice />
        </div>

        <aside
          aria-labelledby="university-documents-topics"
          className="lg:border-l lg:border-border lg:pl-6"
        >
          <h2
            id="university-documents-topics"
            className="font-mono text-xs tracking-wide text-foreground uppercase"
          >
            Helpful to include
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {universityDocumentTopics.map((topic) => (
              <li key={topic} className="flex gap-2.5">
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {topic}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-lg bg-secondary px-3.5 py-3 text-sm leading-relaxed text-secondary-foreground">
            You don't need all of these. Upload whatever you have — more detail
            just means a more accurate plan.
          </p>
        </aside>
      </div>

      <div className="mt-10">
        <StepActions
          backTo={ROUTES.onboarding.university}
          backLabel="University details"
          continueLabel={catalogFound ? "Upload and continue" : "Continue"}
          pendingLabel={progress.label}
          status={
            fileCount > 0
              ? `${pluralize(fileCount, "file")} ready to include`
              : undefined
          }
        />
      </div>
    </form>
  );
}
