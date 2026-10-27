import { Check } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { LocalFilesNotice } from "@/components/onboarding/uploads/local-files-notice";
import { OnboardingPageHeader } from "@/components/onboarding/onboarding-page-header";
import { StepActions } from "@/components/onboarding/step-actions";
import { UniversitySummary } from "@/components/onboarding/university-summary";
import { MultiFileUploader } from "@/components/onboarding/uploads/multi-file-uploader";
import { universityDocumentTopics } from "@/data/upload-guidance";
import { useUploadForm } from "@/hooks/use-upload-form";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { pluralize } from "@/lib/files/format";
import {
  selectCatalog,
  selectUniversity,
  submitUniversityDocs,
} from "@/store/slices/onboarding/onboarding-slice";
import { ROUTES } from "@/lib/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const ERROR_ID = "university-documents-error";

export function UniversityDocumentsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const university = useAppSelector(selectUniversity);
  const catalog = useAppSelector(selectCatalog);
  const universityDocuments = useUploadQueue("universityDocuments");
  const { error, submit } = useUploadForm(
    universityDocuments,
    "Add at least one PDF or screenshot of your university's course information to continue.",
  );

  if (!university)
    return <Navigate to={ROUTES.onboarding.university} replace />;

  const catalogFound = catalog?.status === "available";
  const fileCount = universityDocuments.items.length;

  return (
    <form
      noValidate
      aria-labelledby="university-documents-title"
      onSubmit={submit(() => {
        dispatch(submitUniversityDocs());
        navigate(ROUTES.onboarding.transcript);
      })}
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
                We already have {university.name}'s public catalog. Add
                documents for anything it may not cover, such as department
                program sheets or updated requirements.
              </p>
            ) : (
              <p>
                We couldn't find publicly available academic information for
                your university. To build an accurate academic plan, please
                upload your university's course information.
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
          />
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
          continueLabel="Continue"
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
