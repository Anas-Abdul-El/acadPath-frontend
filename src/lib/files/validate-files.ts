import { formatBytes } from "@/lib/files/format";
import {
  detectKind,
  type UploadConfig,
  type UploadKind,
} from "@/lib/files/upload-config";
import { createFileSchema } from "@/schemas/upload";

export type AcceptedFile = { file: File; kind: UploadKind };
export type RejectedFile = { name: string; reason: string };

type ExistingFile = Pick<File, "name" | "size" | "lastModified">;

const fingerprint = (file: ExistingFile) =>
  `${file.name}:${file.size}:${file.lastModified}`;

/**
 * Splits an incoming selection into files that can be added and files that can't, with a
 * reason for each rejection. Type and size come from the Zod file schema; duplicate, count,
 * and total-size checks account for the files already added.
 */
export function validateFiles(
  incoming: File[],
  existing: ExistingFile[],
  config: UploadConfig,
): { accepted: AcceptedFile[]; rejected: RejectedFile[] } {
  const fileSchema = createFileSchema(config);
  const accepted: AcceptedFile[] = [];
  const rejected: RejectedFile[] = [];
  const seen = new Set(existing.map(fingerprint));
  let count = existing.length;
  let totalSize = existing.reduce((sum, file) => sum + file.size, 0);

  for (const file of incoming) {
    const parsed = fileSchema.safeParse(file);
    const kind = detectKind(file, config);
    let reason: string | undefined;

    if (!parsed.success || !kind)
      reason = parsed.error?.issues[0]?.message ?? "Unsupported file type.";
    else if (seen.has(fingerprint(file))) reason = "Already added.";
    else if (count >= config.maxFiles)
      reason = `You can add up to ${config.maxFiles} files.`;
    else if (totalSize + file.size > config.maxTotalSize)
      reason = `Would exceed the ${formatBytes(config.maxTotalSize)} total limit.`;

    if (reason || !kind) {
      rejected.push({
        name: file.name,
        reason: reason ?? "Unsupported file type.",
      });
      continue;
    }

    accepted.push({ file, kind });
    seen.add(fingerprint(file));
    count += 1;
    totalSize += file.size;
  }

  return { accepted, rejected };
}
