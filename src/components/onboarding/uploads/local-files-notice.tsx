import { HardDrive } from "lucide-react";

/** Honest description of what happens to selected files in the frontend-only prototype. */
export function LocalFilesNotice() {
  return (
    <p className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
      <HardDrive className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-medium text-foreground">Prototype:</span> upload
        progress is simulated. Files stay in this browser tab — they aren't sent
        to a server, stored, or analyzed — and refreshing the page or signing
        out clears them.
      </span>
    </p>
  );
}
