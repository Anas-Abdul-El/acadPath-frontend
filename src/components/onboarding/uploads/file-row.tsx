import { Check, X } from "lucide-react";

import { FileThumbnail } from "@/components/onboarding/uploads/file-thumbnail";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "@/store/slices/uploads/uploads-slice";
import { fileTypeLabel, formatBytes } from "@/lib/files/format";

type FileRowProps = {
  item: UploadItem;
  onRemove: (item: UploadItem) => void;
};

export function FileRow({ item, onRemove }: FileRowProps) {
  const { file, kind, status, progress } = item;
  const simulating = status === "simulating";

  return (
    <li className="flex items-center gap-3.5 px-4 py-3 sm:px-5">
      <FileThumbnail file={file} kind={kind} />

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium text-foreground"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>{fileTypeLabel(file)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-tabular">{formatBytes(file.size)}</span>
        </p>

        {simulating ? (
          <div className="mt-2 flex items-center gap-2.5">
            <div
              role="progressbar"
              aria-label={`Simulated upload of ${file.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="h-1 max-w-48 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary/70 transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[0.6875rem] text-muted-foreground font-tabular">
              Simulating {Math.round(progress)}%
            </span>
          </div>
        ) : null}
      </div>

      {!simulating ? (
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
          <Check className="size-3 text-success" aria-hidden="true" />
          Ready · not sent
        </span>
      ) : null}
      <span className="sr-only">
        {simulating ? "Simulating upload" : "Ready, not sent to a server"}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={() => onRemove(item)}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X />
      </Button>
    </li>
  );
}
