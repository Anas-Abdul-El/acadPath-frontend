import { ClipboardList, FileSpreadsheet, MonitorSmartphone, type LucideIcon } from "lucide-react"

/** What students can include on the University Documents step. None of it is required. */
export const universityDocumentTopics: string[] = [
  "Course names and course codes",
  "Course descriptions",
  "Credit hours",
  "Prerequisites and corequisites",
  "Required courses and electives",
  "Major and general education requirements",
  "Curriculum and degree requirements",
  "Semester offerings and other academic rules",
]

export type RecordType = {
  icon: LucideIcon
  title: string
  description: string
}

/** Document types accepted on the Academic Transcript step. */
export const transcriptDocumentTypes: RecordType[] = [
  {
    icon: FileSpreadsheet,
    title: "Academic transcript",
    description: "Official or unofficial — completed courses, grades, and credits by term.",
  },
  {
    icon: ClipboardList,
    title: "Curriculum or degree audit",
    description: "Shows required courses and what's still remaining for your degree.",
  },
  {
    icon: MonitorSmartphone,
    title: "Student portal screenshots",
    description: "If you can't download documents, screenshots of your grades or audit work too.",
  },
]

