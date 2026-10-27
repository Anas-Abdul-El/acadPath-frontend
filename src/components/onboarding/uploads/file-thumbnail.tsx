import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";

import type { UploadKind } from "@/lib/files/upload-config";
import { cn } from "@/lib/utils";

type FileThumbnailProps = {
  file: File;
  kind: UploadKind;
  className?: string;
};

export function FileThumbnail({ file, kind, className }: FileThumbnailProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary",
        className,
      )}
    >
      {kind === "image" ? (
        <ImagePreview file={file} />
      ) : (
        <span className="flex flex-col items-center text-secondary-foreground">
          <FileText className="size-5" strokeWidth={1.6} />
          <span className="mt-0.5 font-mono text-[0.5625rem] leading-none font-medium tracking-wide">
            PDF
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * The object URL is created and revoked inside one effect, so every URL is released
 * when the row unmounts or the file changes (and Strict Mode's re-run stays balanced).
 */
function ImagePreview({ file }: { file: File }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <img ref={ref} alt="" decoding="async" className="size-full object-cover" />
  );
}
