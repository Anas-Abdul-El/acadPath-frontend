import { GraduationCap } from "lucide-react";

/** Shown in place of the transcript uploader for first-term students. */
export function NewStudentNotice() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <GraduationCap className="size-4.5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-medium text-foreground">
          No transcript needed for your first term
        </p>
        <p className="mt-1 text-muted-foreground">
          You haven't completed any courses yet, so there's nothing to upload.
          Your plan starts from the beginning of your degree with a 0.00 GPA and
          0 credits earned.
        </p>
      </div>
    </div>
  );
}
