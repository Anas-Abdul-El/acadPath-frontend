import { z } from "zod";

import { formatBytes } from "@/lib/files/format";
import { detectKind, type UploadConfig } from "@/lib/files/upload-config";

/** Validates one incoming file against the type and size limits in `config`. */
export function createFileSchema(config: UploadConfig) {
  return z
    .instanceof(File, { message: "Not a file." })
    .superRefine((file, ctx) => {
      if (!detectKind(file, config))
        ctx.addIssue({
          code: "custom",
          message:
            "Unsupported file type. Use a PDF or a PNG, JPG, or WEBP image.",
        });
      else if (file.size === 0)
        ctx.addIssue({ code: "custom", message: "The file is empty." });
      else if (file.size > config.maxFileSize)
        ctx.addIssue({
          code: "custom",
          message: `Larger than the ${formatBytes(config.maxFileSize)} limit per file (${formatBytes(file.size)}).`,
        });
    });
}

/** Validates a whole submission: at least one file, within limits, none still transferring. */
export function createUploadFormSchema(
  config: UploadConfig,
  emptyMessage: string,
) {
  const item = z.object({
    file: createFileSchema(config),
    status: z.enum(["simulating", "ready"]),
  });

  return z.object({
    files: z
      .array(item)
      .min(1, emptyMessage)
      .max(config.maxFiles, `Upload at most ${config.maxFiles} files.`)
      .refine(
        (items) =>
          items.reduce((sum, { file }) => sum + file.size, 0) <=
          config.maxTotalSize,
        `Keep the total under ${formatBytes(config.maxTotalSize)}. Remove a file to continue.`,
      )
      .refine(
        (items) => items.every((entry) => entry.status === "ready"),
        "Wait for every file to finish before continuing.",
      ),
  });
}

export type UploadFormValues = z.infer<
  ReturnType<typeof createUploadFormSchema>
>;
