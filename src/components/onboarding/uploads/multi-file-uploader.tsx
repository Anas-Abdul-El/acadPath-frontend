import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { FileImage, FileText, Plus, TriangleAlert, X } from "lucide-react";

import { FileRow } from "@/components/onboarding/uploads/file-row";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { UploadQueue } from "@/hooks/use-upload-queue";
import type { UploadItem } from "@/store/slices/uploads/uploads-slice";
import { formatBytes, pluralize } from "@/lib/files/format";
import {
  acceptAttribute,
  acceptedFormatsLabel,
} from "@/lib/files/upload-config";
import { validateFiles } from "@/lib/files/validate-files";
import { cn } from "@/lib/utils";

type MultiFileUploaderProps = {
  queue: UploadQueue;
  /** Accessible name for the file picker, e.g. "University document files". */
  label: string;
  /** One line describing what belongs here, shown inside the drop zone. */
  hint: ReactNode;
  /** Submission-level error, e.g. "Add at least one file". */
  error?: string;
  errorId?: string;
};

/**
 * Drag-and-drop + picker for multiple PDFs and images. Files are validated against the
 * queue's config, listed with previews, and can be removed individually. Nothing is sent
 * to a server — progress is simulated by the uploads slice.
 */
export function MultiFileUploader({
  queue,
  label,
  hint,
  error,
  errorId,
}: MultiFileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLButtonElement>(null);
  const chooseRef = useRef<HTMLButtonElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const { config, items, rejected, totalSize } = queue;
  const hasFiles = items.length > 0;
  const full = items.length >= config.maxFiles;

  const add = (files: File[]) => {
    if (files.length === 0) return;
    const { accepted, rejected: invalid } = validateFiles(
      files,
      items.map((item) => item.file),
      config,
    );
    const { added, rejected: rejectedCount } = queue.addValidated(
      accepted,
      invalid,
    );
    const parts = [];
    if (added) parts.push(`Added ${pluralize(added, "file")}.`);
    if (rejectedCount)
      parts.push(`${pluralize(rejectedCount, "file")} couldn't be added.`);
    setAnnouncement(parts.join(" "));
  };

  const openPicker = () => inputRef.current?.click();

  const remove = (item: UploadItem) => {
    queue.removeFile(item.id);
    setAnnouncement(`Removed ${item.file.name}.`);
    // Keep focus on the page once the row (and maybe the whole list) disappears.
    requestAnimationFrame(() =>
      (addMoreRef.current ?? chooseRef.current)?.focus(),
    );
  };

  // A file dropped just outside the zone would otherwise make the browser navigate away to it.
  useEffect(() => {
    const block = (event: globalThis.DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) event.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  const onDragEnter = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    add(Array.from(event.dataTransfer.files));
  };

  const limits = `${acceptedFormatsLabel(config)} · up to ${formatBytes(config.maxFileSize)} each · ${config.maxFiles} files max`;

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={acceptAttribute(config)}
        aria-label={label}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          add(Array.from(event.target.files ?? []));
          event.target.value = ""; // allow re-selecting the same file after removing it
        }}
      />

      <div
        onClick={full ? undefined : openPicker}
        onDragEnter={onDragEnter}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes("Files"))
            event.preventDefault();
        }}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "group relative rounded-xl border-[1.5px] border-dashed transition-colors",
          hasFiles ? "px-5 py-5" : "bg-grid-paper px-6 py-12 sm:py-14",
          dragging
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive/60 bg-card"
              : "border-input bg-card hover:border-primary/50",
          full ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        )}
      >
        <div
          className={cn(
            "flex gap-4",
            hasFiles
              ? "flex-col items-start sm:flex-row sm:items-center"
              : "flex-col items-center text-center",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("flex shrink-0", hasFiles && "hidden sm:flex")}
          >
            <span className="flex size-11 -rotate-6 items-center justify-center rounded-lg border border-border bg-background text-secondary-foreground shadow-xs">
              <FileText className="size-5" strokeWidth={1.6} />
            </span>
            <span className="-ml-3 flex size-11 rotate-6 items-center justify-center rounded-lg border border-border bg-background text-secondary-foreground shadow-xs">
              <FileImage className="size-5" strokeWidth={1.6} />
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-medium text-foreground",
                hasFiles ? "text-sm" : "text-base",
              )}
            >
              {dragging
                ? "Drop to add these files"
                : full
                  ? `You've added the maximum of ${config.maxFiles} files`
                  : hasFiles
                    ? "Drop more PDFs or screenshots here"
                    : "Drag PDFs and screenshots here"}
            </p>
            {!hasFiles ? (
              <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
            ) : null}
            <p
              className={cn(
                "text-xs text-muted-foreground",
                hasFiles ? "mt-0.5" : "mt-3",
              )}
            >
              {limits}
            </p>
          </div>

          {!hasFiles ? (
            <Button
              ref={chooseRef}
              type="button"
              variant="outline"
              size="xl"
              className="mt-1 bg-background"
            >
              Choose files
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {rejected.length > 0 ? (
        <Alert variant="destructive" className="py-3 pl-3.5">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>
            {pluralize(rejected.length, "file")} couldn't be added
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-1 space-y-1">
              {rejected.map((file, index) => (
                <li key={`${file.name}-${index}`} className="text-pretty">
                  <span className="font-medium break-all">{file.name}</span> —{" "}
                  {file.reason}
                </li>
              ))}
            </ul>
          </AlertDescription>
          <AlertAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={queue.clearRejected}
              aria-label="Dismiss file errors"
            >
              <X />
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {hasFiles ? (
        <section
          aria-label="Selected files"
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
            <p className="text-sm text-foreground">
              <span className="font-medium">
                {pluralize(items.length, "file")}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · <span className="font-tabular">
                  {formatBytes(totalSize)}
                </span>{" "}
                of {formatBytes(config.maxTotalSize)}
              </span>
            </p>
            <Button
              ref={addMoreRef}
              type="button"
              variant="outline"
              size="lg"
              className="bg-background"
              onClick={openPicker}
              disabled={full}
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add more files
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <FileRow key={item.id} item={item} onRemove={remove} />
            ))}
          </ul>
        </section>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
