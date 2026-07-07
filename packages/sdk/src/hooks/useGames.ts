import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useGames(params?: { status?: string; teamSlug?: string }) {
  return useQuery({
    queryKey: ['games', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/games', { params: { query: params as any } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useGame(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/games/{gameId}', { params: { path: { gameId } } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(gameId),
  })
}

export function useCreateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      sportSlug: string
      seasonId?: string
      scheduledAt: string
      venue?: string
      homeTeamId: string
      awayTeamId: string
    }) => {
      const { data, error, response } = await getApiClient().POST('/games', { body })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export function useGameStats(gameId: string) {
  return useQuery({
    queryKey: ['game', gameId, 'stats'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/games/{gameId}/stats', { params: { path: { gameId } } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(gameId),
  })
}
