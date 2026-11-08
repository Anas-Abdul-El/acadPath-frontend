import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api, getData } from "@/api/client"
import { queryKeys } from "@/api/query-keys"
import type {
  AdminCourseDto,
  AdminCourseQuery,
  AdminCourseRequest,
  AdminMajorDto,
  AdminMajorRequest,
  AdminStatsDto,
  AdminStudentDetailDto,
  AdminStudentDto,
  AdminStudentQuery,
  AdminUniversityDetailDto,
  AdminUniversityDto,
  AdminUniversityQuery,
  AdminUniversityRequest,
  DataEnvelope,
  MajorDto,
  Paginated,
} from "@/api/types"

/** Drops empty filters so they don't end up in the query string (or split the cache). */
function clean<T extends object>(query: T): T {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as T
}

async function getPage<T>(url: string, query: object, signal?: AbortSignal): Promise<Paginated<T>> {
  const { data } = await api.get<Paginated<T>>(url, { params: clean(query), signal })
  return data
}

/** Every admin mutation can change counts shown elsewhere, so the whole admin cache refreshes. */
function useInvalidateAdmin() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
}

// ── Stats ────────────────────────────────────────────────────────────────────

export function useAdminStats(months = 8) {
  return useQuery({
    queryKey: queryKeys.admin.stats(months),
    queryFn: ({ signal }) => getData<AdminStatsDto>("/admin/stats", { months }, signal),
  })
}

// ── Universities ─────────────────────────────────────────────────────────────

export function useAdminUniversities(query: AdminUniversityQuery, enabled = true) {
  const params = clean(query)
  return useQuery({
    queryKey: queryKeys.admin.universities(params),
    queryFn: ({ signal }) => getPage<AdminUniversityDto>("/admin/universities", params, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

/** Universities for filter and form selects (the API caps a page at 100). */
export function useUniversityOptions() {
  return useAdminUniversities({ page: 1, pageSize: 100 })
}

export function useAdminUniversity(universityId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.university(universityId ?? ""),
    queryFn: ({ signal }) => getData<AdminUniversityDetailDto>(`/admin/universities/${universityId}`, undefined, signal),
    enabled: Boolean(universityId),
  })
}

export function useSaveUniversity() {
  const invalidate = useInvalidateAdmin()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: AdminUniversityRequest }) => {
      const { data } = id
        ? await api.patch<DataEnvelope<AdminUniversityDto>>(`/admin/universities/${id}`, body)
        : await api.post<DataEnvelope<AdminUniversityDto>>("/admin/universities", body)
      return data.data
    },
    meta: { silent: true },
    onSuccess: invalidate,
  })
}

export function useDeleteUniversity() {
  const invalidate = useInvalidateAdmin()
  return useMutation({
    mutationFn: async (universityId: string) => {
      await api.delete(`/admin/universities/${universityId}`)
    },
    onSuccess: invalidate,
  })
}

// ── Majors ───────────────────────────────────────────────────────────────────

export function useAdminMajors(universityId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.majors(universityId ?? ""),
    queryFn: ({ signal }) => getData<AdminMajorDto[]>(`/admin/universities/${universityId}/majors`, undefined, signal),
    enabled: Boolean(universityId),
  })
}

export function useSaveMajor() {
  const invalidate = useInvalidateAdmin()
  return useMutation({
    mutationFn: async ({
      universityId,
      majorId,
      body,
    }: {
      universityId: string
      majorId?: string
      body: AdminMajorRequest
    }) => {
      const { data } = majorId
        ? await api.patch<DataEnvelope<MajorDto>>(`/admin/majors/${majorId}`, body)
        : await api.post<DataEnvelope<MajorDto>>(`/admin/universities/${universityId}/majors`, body)
      return data.data
    },
    meta: { silent: true },
    onSuccess: invalidate,
  })
}

export function useDeleteMajor() {
  const invalidate = useInvalidateAdmin()
  return useMutation({
    mutationFn: async (majorId: string) => {
      await api.delete(`/admin/majors/${majorId}`)
    },
    onSuccess: invalidate,
  })
}

// ── Courses ──────────────────────────────────────────────────────────────────

export function useAdminCourses(query: AdminCourseQuery) {
  const params = clean(query)
  return useQuery({
    queryKey: queryKeys.admin.courses(params),
    queryFn: ({ signal }) => getPage<AdminCourseDto>("/admin/courses", params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useSaveCourse() {
  const invalidate = useInvalidateAdmin()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: AdminCourseRequest }) => {
      const { data } = id
        ? await api.patch<DataEnvelope<AdminCourseDto>>(`/admin/courses/${id}`, body)
        : await api.post<DataEnvelope<AdminCourseDto>>("/admin/courses", body)
      return data.data
    },
    meta: { silent: true },
    onSuccess: invalidate,
  })
}

export function useDeleteCourse() {
  const invalidate = useInvalidateAdmin()
  return useMutation({
    mutationFn: async (courseId: string) => {
      await api.delete(`/admin/courses/${courseId}`)
    },
    onSuccess: invalidate,
  })
}

// ── Students ─────────────────────────────────────────────────────────────────

export function useAdminStudents(query: AdminStudentQuery) {
  const params = clean(query)
  return useQuery({
    queryKey: queryKeys.admin.students(params),
    queryFn: ({ signal }) => getPage<AdminStudentDto>("/admin/students", params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useAdminStudent(studentId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.student(studentId ?? ""),
    queryFn: ({ signal }) => getData<AdminStudentDetailDto>(`/admin/students/${studentId}`, undefined, signal),
    enabled: Boolean(studentId),
  })
}
