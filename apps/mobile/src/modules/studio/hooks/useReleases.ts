import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError, type components } from '@statman/sdk'

export type CardRelease = components['schemas']['CardRelease']
export type CardIssue = components['schemas']['CardIssue']
export type CreateReleaseInput = components['schemas']['CreateReleaseInput']
export type CardEditionMode = components['schemas']['CardEditionMode']

export function generateStableRequestId(prefix = 'req'): string {
  const time = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${time}_${rand}`
}

export function useRelease(releaseId: string | undefined) {
  return useQuery({
    queryKey: ['releases', releaseId],
    enabled: Boolean(releaseId),
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/releases/{releaseId}', {
        params: { path: { releaseId: releaseId! } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
  })
}

export function useCreateRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateReleaseInput) => {
      const { data, error, response } = await getApiClient().POST('/releases', {
        body,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (newRelease) => {
      queryClient.setQueryData(['releases', newRelease.id], newRelease)
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useGenerateRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (releaseId: string) => {
      const { data, error, response } = await getApiClient().POST('/releases/{releaseId}/generate', {
        params: { path: { releaseId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['releases', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function usePublishRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      releaseId,
      visibility = 'PUBLIC',
    }: {
      releaseId: string
      visibility?: 'PUBLIC' | 'PRIVATE'
    }) => {
      const { data, error, response } = await getApiClient().POST('/releases/{releaseId}/publish', {
        params: { path: { releaseId } },
        body: { visibility },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (published) => {
      queryClient.setQueryData(['releases', published.id], published)
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['storefronts'] })
      queryClient.invalidateQueries({ queryKey: ['my-storefront'] })
    },
  })
}

export function useClaimRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (releaseId: string) => {
      const { data, error, response } = await getApiClient().POST('/releases/{releaseId}/issues', {
        params: { path: { releaseId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (_issue, releaseId) => {
      queryClient.invalidateQueries({ queryKey: ['releases', releaseId] })
      queryClient.invalidateQueries({ queryKey: ['cards', releaseId] })
      queryClient.invalidateQueries({ queryKey: ['collection'] })
    },
  })
}

export function useArchiveRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (releaseId: string) => {
      const { data, error, response } = await getApiClient().POST('/releases/{releaseId}/archive', {
        params: { path: { releaseId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (archived) => {
      queryClient.setQueryData(['releases', archived.id], archived)
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['storefronts'] })
    },
  })
}
