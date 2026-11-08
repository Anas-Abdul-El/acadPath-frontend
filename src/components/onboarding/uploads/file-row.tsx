import { Check, X } from "lucide-react";

import { FileThumbnail } from "@/components/onboarding/uploads/file-thumbnail";
import { Button } from "@/components/ui/button";
import type { UploadItem } from "@/store/slices/uploads/uploads-slice";
import { fileTypeLabel, formatBytes } from "@/lib/files/format";

type FileRowProps = {
  item: UploadItem;
  onRemove: (item: UploadItem) => void;
  /** True while the selection is being uploaded. */
  disabled?: boolean;
};

export function FileRow({ item, onRemove, disabled }: FileRowProps) {
  const { file, kind } = item;

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
      </div>

      <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
        <Check className="size-3 text-success" aria-hidden="true" />
        Ready
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={() => onRemove(item)}
        disabled={disabled}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X />
      </Button>
    </li>
  );
}
