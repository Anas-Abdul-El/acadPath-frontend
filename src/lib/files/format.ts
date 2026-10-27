const UNITS = ["B", "KB", "MB", "GB"];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || Number.isInteger(value) ? Math.round(value) : value.toFixed(1)} ${UNITS[unit]}`;
}

/** Short type label shown next to a file, e.g. "PDF" or "PNG image". */
export function fileTypeLabel(file: File): string {
  const extension = file.name.split(".").pop()?.toUpperCase();
  if (file.type === "application/pdf" || extension === "PDF")
    return "PDF document";
  return `${extension === "JPEG" ? "JPG" : (extension ?? "Image")} image`;
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}
