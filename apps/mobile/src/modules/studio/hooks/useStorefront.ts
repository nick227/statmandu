import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError, useCurrentUser, type components } from '@statman/sdk'

export type Storefront = components['schemas']['Storefront']
export type CardRelease = components['schemas']['CardRelease']
export type UpdateStorefrontInput = components['schemas']['UpdateStorefrontInput']

export function useStorefrontUser() {
  const query = useCurrentUser()
  return {
    user: query.data?.data,
    username: query.data?.data?.profile?.username ?? null,
    isLoading: query.isLoading,
  }
}

export function useMyStorefront() {
  return useQuery({
    queryKey: ['my-storefront'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/me/storefront')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
  })
}

export function useUpdateMyStorefront() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: UpdateStorefrontInput) => {
      const { data, error, response } = await getApiClient().PATCH('/me/storefront', {
        body,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['my-storefront'], updated)
      if (updated.username) {
        queryClient.setQueryData(['storefront', updated.username], updated)
      }
      queryClient.invalidateQueries({ queryKey: ['storefronts'] })
    },
  })
}

export function useStorefront(username: string | undefined) {
  return useQuery({
    queryKey: ['storefront', username],
    enabled: Boolean(username),
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/storefronts/{username}', {
        params: { path: { username: username! } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!.data
    },
  })
}

export function useStorefrontReleases(username: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['storefront', username, 'releases', limit],
    enabled: Boolean(username),
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/storefronts/{username}/releases', {
        params: {
          path: { username: username! },
          query: { limit },
        },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return {
        releases: data?.data ?? [],
        meta: data?.meta,
      }
    },
  })
}
