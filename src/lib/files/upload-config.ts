export type UploadKind = "pdf" | "image";

export type UploadConfig = {
  /** Accepted MIME types mapped to their file kind. */
  mimeTypes: Record<string, UploadKind>;
  /** Extensions used as a fallback when the browser reports no MIME type. */
  extensions: Record<string, UploadKind>;
  maxFiles: number;
  /** Bytes. */
  maxFileSize: number;
  /** Bytes, across every file in one submission. */
  maxTotalSize: number;
};

const MB = 1024 * 1024;

/** Shared defaults for academic document uploads. Pages can override any limit. */
export const DOCUMENT_UPLOAD_CONFIG: UploadConfig = {
  mimeTypes: {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/webp": "image",
  },
  extensions: {
    pdf: "pdf",
    png: "image",
    jpg: "image",
    jpeg: "image",
    webp: "image",
  },
  maxFiles: 20,
  maxFileSize: 25 * MB,
  maxTotalSize: 150 * MB,
};

/** Value for the file input's `accept` attribute. */
export function acceptAttribute(config: UploadConfig): string {
  return [
    ...Object.keys(config.mimeTypes),
    ...Object.keys(config.extensions).map((ext) => `.${ext}`),
  ].join(",");
}

export function acceptedFormatsLabel(config: UploadConfig): string {
  const names = Object.keys(config.extensions)
    .filter((ext) => ext !== "jpeg")
    .map((ext) => ext.toUpperCase());
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`
    : names.join("");
}

export function detectKind(
  file: File,
  config: UploadConfig,
): UploadKind | undefined {
  const byMime = config.mimeTypes[file.type];
  if (byMime) return byMime;
  // Some platforms report an empty (or generic) type — fall back to the extension.
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return file.type && file.type !== "application/octet-stream"
    ? undefined
    : config.extensions[extension];
}
