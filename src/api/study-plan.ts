import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api, getData, LONG_TIMEOUT } from "@/api/client"
import { queryKeys } from "@/api/query-keys"
import type {
  DataEnvelope,
  GeneratePlanRequest,
  PlannedCourseStatus,
  StudyPlanCourseDto,
  StudyPlanDto,
} from "@/api/types"

/** The latest study plan, or null when none has been generated yet. */
export function useStudyPlan() {
  return useQuery({
    queryKey: queryKeys.studyPlan,
    queryFn: ({ signal }) => getData<StudyPlanDto | null>("/me/study-plan", undefined, signal),
  })
}

export function useGeneratePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: GeneratePlanRequest = {}) => {
      const { data } = await api.post<DataEnvelope<StudyPlanDto>>("/me/study-plan/generate", body, {
        timeout: LONG_TIMEOUT,
      })
      return data.data
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKeys.studyPlan, plan)
      // Planned credits, expected graduation and course statuses all follow the new plan.
      return queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "academics" && query.queryKey[1] !== "study-plan",
      })
    },
  })
}

type SkipVariables = { planCourseId: string; status: Extract<PlannedCourseStatus, "PLANNED" | "SKIPPED"> }

/** Skips a planned course or restores it, updating the cached plan right away. */
export function useSetPlanCourseStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ planCourseId, status }: SkipVariables) => {
      const { data } = await api.patch<DataEnvelope<StudyPlanCourseDto>>(`/me/study-plan/courses/${planCourseId}`, {
        status,
      })
      return data.data
    },
    onMutate: async ({ planCourseId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.studyPlan })
      const previous = queryClient.getQueryData<StudyPlanDto | null>(queryKeys.studyPlan)
      if (previous) {
        queryClient.setQueryData<StudyPlanDto>(queryKeys.studyPlan, {
          ...previous,
          semesters: previous.semesters.map((semester) => ({
            ...semester,
            courses: semester.courses.map((course) => (course.id === planCourseId ? { ...course, status } : course)),
          })),
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(queryKeys.studyPlan, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["academics"] }),
  })
}
