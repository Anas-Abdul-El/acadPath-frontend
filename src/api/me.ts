import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosProgressEvent } from "axios"

import { api, getData, LONG_TIMEOUT } from "@/api/client"
import { isApiError } from "@/api/errors"
import { queryKeys } from "@/api/query-keys"
import { hasSessionHint } from "@/api/token"
import type {
  DataEnvelope,
  MeDto,
  ProfilePatchRequest,
  StudentDocumentDto,
  StudentDocumentType,
  UniversitySelectionDto,
  UniversitySelectionRequest,
  UniversitySourceDto,
  UniversitySourcesUploadDto,
} from "@/api/types"

// ── Fetchers ─────────────────────────────────────────────────────────────────

/** The signed-in user, or null when there's no session (no network call for a fresh visitor). */
export async function fetchMe(signal?: AbortSignal): Promise<MeDto | null> {
  if (!hasSessionHint()) return null
  try {
    return await getData<MeDto>("/me", undefined, signal)
  } catch (err) {
    if (isApiError(err, 401)) return null
    throw err
  }
}

/** Sends files as `multipart/form-data` under `files`, reporting upload progress as 0–100. */
async function uploadFiles<T>(
  url: string,
  files: File[],
  fields: Record<string, string>,
  onProgress?: (percent: number) => void,
): Promise<T> {
  const body = new FormData()
  for (const file of files) body.append("files", file)
  for (const [key, value] of Object.entries(fields)) body.append(key, value)

  const { data } = await api.post<DataEnvelope<T>>(url, body, {
    timeout: LONG_TIMEOUT,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })
  return data.data
}

// ── Queries ──────────────────────────────────────────────────────────────────

export const meQuery = queryOptions({
  queryKey: queryKeys.me,
  queryFn: ({ signal }) => fetchMe(signal),
  staleTime: Infinity,
  retry: false,
})

export function useMe() {
  return useQuery(meQuery)
}

/** The current user, for components rendered behind `RequireAuth` (where it's always loaded). */
export function useCurrentUser(): MeDto {
  const { data } = useMe()
  if (!data) throw new Error("useCurrentUser must be used inside an authenticated route")
  return data
}

export function useDocuments(type?: StudentDocumentType) {
  return useQuery({
    queryKey: queryKeys.documents(type),
    queryFn: ({ signal }) => getData<StudentDocumentDto[]>("/me/documents", { type }, signal),
  })
}

export function useUniversitySources(enabled = true) {
  return useQuery({
    queryKey: queryKeys.universitySources,
    queryFn: ({ signal }) => getData<UniversitySourceDto[]>("/me/university/sources", undefined, signal),
    enabled,
  })
}

// ── Mutations ────────────────────────────────────────────────────────────────

export function useSelectUniversity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UniversitySelectionRequest) => {
      const { data } = await api.put<DataEnvelope<UniversitySelectionDto>>("/me/university", body, {
        timeout: LONG_TIMEOUT,
      })
      return data.data
    },
    meta: { silent: true },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["academics"] })
      return queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useUploadUniversitySources() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (percent: number) => void }) =>
      uploadFiles<UniversitySourcesUploadDto>("/me/university/sources", files, {}, onProgress),
    meta: { silent: true },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: queryKeys.universitySources })
      await queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: ProfilePatchRequest) => {
      const { data } = await api.patch<DataEnvelope<MeDto>>("/me/profile", body)
      return data.data
    },
    meta: { silent: true },
    onSuccess: (me) => queryClient.setQueryData(queryKeys.me, me),
  })
}

export function useUploadDocuments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      files,
      type = "TRANSCRIPT",
      onProgress,
    }: {
      files: File[]
      type?: StudentDocumentType
      onProgress?: (percent: number) => void
    }) => uploadFiles<StudentDocumentDto[]>("/me/documents", files, { type }, onProgress),
    meta: { silent: true },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["me", "documents"] })
      queryClient.removeQueries({ queryKey: ["academics"] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.me, exact: true })
    },
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<DataEnvelope<MeDto>>("/me/onboarding/complete")
      return data.data
    },
    meta: { silent: true },
    onSuccess: (me) => queryClient.setQueryData(queryKeys.me, me),
  })
}
