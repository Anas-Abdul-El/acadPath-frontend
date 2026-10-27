import { ArrowRight, BookOpenCheck, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CatalogCheckResult } from "@/simulation/onboarding/university-catalog";

type CatalogFoundPanelProps = {
  result: Extract<CatalogCheckResult, { status: "available" }>;
  continueLabel: string;
  onContinue: () => void;
  onUploadAnyway: () => void;
};

export function CatalogFoundPanel({
  result,
  continueLabel,
  onContinue,
  onUploadAnyway,
}: CatalogFoundPanelProps) {
  return (
    <section
      aria-labelledby="catalog-found-title"
      className="overflow-hidden rounded-xl border border-success/30 bg-card"
    >
      <div className="flex gap-4 p-5 sm:p-7">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="catalog-found-title"
            className="text-base font-medium text-foreground"
          >
            We found public course information for {result.universityName}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            AcadPath can use this catalog for course descriptions, credit hours,
            and prerequisites, so you can skip uploading university documents.
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-sm sm:grid-cols-[minmax(0,2fr)_1fr_1fr]">
            <div className="col-span-2 bg-background px-4 py-3 sm:col-span-1">
              <dt className="text-xs text-muted-foreground">Catalog</dt>
              <dd className="mt-0.5 truncate font-medium text-foreground">
                {result.title}
              </dd>
              <dd className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                {result.source}
              </dd>
            </div>
            <div className="bg-background px-4 py-3">
              <dt className="text-xs text-muted-foreground">Courses</dt>
              <dd className="mt-0.5 font-mono text-lg text-foreground font-tabular">
                {result.courses.toLocaleString()}
              </dd>
            </div>
            <div className="bg-background px-4 py-3">
              <dt className="text-xs text-muted-foreground">Programs</dt>
              <dd className="mt-0.5 font-mono text-lg text-foreground font-tabular">
                {result.programs}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onUploadAnyway}
          className="text-muted-foreground"
        >
          <Upload data-icon="inline-start" aria-hidden="true" />
          Upload university documents anyway
        </Button>
        <Button type="button" size="xl" onClick={onContinue}>
          {continueLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}
