import { ShieldCheck } from "lucide-react";

/** What happens to the selected files once the step is submitted. */
export function LocalFilesNotice() {
  return (
    <p className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Files are uploaded when you continue. AcadPath reads them to extract
        your courses, which can take a minute for large files.
      </span>
    </p>
  );
}
