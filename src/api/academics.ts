import { useQuery } from "@tanstack/react-query"

import { api, getData, LONG_TIMEOUT } from "@/api/client"
import { queryKeys } from "@/api/query-keys"
import type {
  AcademicRecordDto,
  DataEnvelope,
  AcademicRecordsQuery,
  AcademicSummaryDto,
  CourseDetailDto,
  MyCourseDto,
  RecommendationsDto,
} from "@/api/types"

export function useAcademicSummary() {
  return useQuery({
    queryKey: queryKeys.academicSummary,
    queryFn: ({ signal }) => getData<AcademicSummaryDto>("/me/academic-summary", undefined, signal),
  })
}

export function useAcademicRecords(query: AcademicRecordsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.academicRecords(query),
    queryFn: ({ signal }) => getData<AcademicRecordDto[]>("/me/academic-records", query, signal),
  })
}

/** Every course in the student's major with their status. Small enough to filter on the client. */
export function useMyCourses() {
  return useQuery({
    queryKey: queryKeys.myCourses,
    queryFn: ({ signal }) => getData<MyCourseDto[]>("/me/courses", undefined, signal),
  })
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.course(courseId ?? ""),
    queryFn: ({ signal }) => getData<CourseDetailDto>(`/courses/${courseId}`, undefined, signal),
    enabled: Boolean(courseId),
  })
}

/** The first load can ask the AI to find resources for courses that have none, so it can be slow. */
export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<DataEnvelope<RecommendationsDto>>("/me/recommendations", {
        signal,
        timeout: LONG_TIMEOUT,
      })
      return data.data
    },
  })
}
