import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

type PlayerListParams = {
  q?: string
  sportSlug?: string
  teamSlug?: string
  position?: 'PG' | 'SG' | 'SF' | 'PF' | 'C'
  classYear?: string
  limit?: number
}

export function usePlayers(params?: PlayerListParams) {
  return useInfiniteQuery({
    queryKey: ['players', params],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const { data, error, response } = await getApiClient().GET('/players', {
        params: { query: { ...params, cursor: pageParam } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
  })
}

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/players/{playerId}', {
        params: { path: { playerId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(playerId),
  })
}

export function useCreatePlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      firstName: string
      lastName: string
      sportSlug: string
      bio?: string
      hometown?: string
      avatarUrl?: string
      position?: string
      classYear?: string
      jerseyNumber?: number
      heightInches?: number
    }) => {
      const { data, error, response } = await getApiClient().POST('/players', { body: body as any })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['me-capabilities'] })
    },
  })
}

export function useUpdatePlayer(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data, error, response } = await getApiClient().PATCH('/players/{playerId}', {
        params: { path: { playerId } },
        body: body as any,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', playerId] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}
