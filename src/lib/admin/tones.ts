import type { CatalogStatus, CourseCategory, ProcessingStatus, StudentStage } from "@/api/types"
import type { BadgeTone } from "@/components/admin/status-badge"

export const CATALOG_STATUS_TONE: Record<CatalogStatus, BadgeTone> = {
  AVAILABLE: "success",
  PROCESSING: "info",
  UNAVAILABLE: "warning",
}

export const PROCESSING_STATUS_TONE: Record<ProcessingStatus, BadgeTone> = {
  PENDING: "neutral",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
}

export const CATEGORY_TONE: Record<CourseCategory, BadgeTone> = {
  MAJOR_REQUIREMENT: "info",
  MAJOR_ELECTIVE: "highlight",
  MATH_SCIENCE: "neutral",
  GENERAL_EDUCATION: "neutral",
}

export const STAGE: Record<StudentStage, { label: string; tone: BadgeTone; description: string }> = {
  PROCESSED: { label: "Records processed", tone: "success", description: "Transcript extracted into academic records" },
  UPLOADED: { label: "Documents uploaded", tone: "info", description: "Documents on file, no records yet" },
  NONE: { label: "No documents", tone: "neutral", description: "Nothing uploaded yet" },
}
