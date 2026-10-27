import type { AdminState } from "@/store/slices/admin/admin-slice"

export function universityById(state: AdminState) {
  return new Map(state.universities.map((university) => [university.id, university]))
}

export function studentById(state: AdminState) {
  return new Map(state.students.map((student) => [student.id, student]))
}

export function courseCountByUniversity(state: AdminState) {
  const counts = new Map<string, number>()
  for (const course of state.courses) counts.set(course.universityId, (counts.get(course.universityId) ?? 0) + 1)
  return counts
}

export function studentCountByUniversity(state: AdminState) {
  const counts = new Map<string, number>()
  for (const student of state.students) counts.set(student.universityId, (counts.get(student.universityId) ?? 0) + 1)
  return counts
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** New registrations per month for 2026, from March (launch) to October. */
export function registrationsByMonth(state: AdminState) {
  return MONTHS.slice(2, 10).map((label, index) => {
    const month = String(index + 3).padStart(2, "0")
    return { month: label, count: state.students.filter((s) => s.registeredAt.slice(5, 7) === month).length }
  })
}
