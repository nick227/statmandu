import { useQuery } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function usePlayerGames(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId, 'games'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/players/{playerId}/games', {
        params: { path: { playerId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(playerId),
  })
}

export function usePlayerSeasonStats(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId, 'stats'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/players/{playerId}/stats', {
        params: { path: { playerId } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(playerId),
  })
}

export function usePlayerLeaderboard(params: { sportSlug: string; stat: string; seasonId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['leaderboards', 'players', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/leaderboards/players', {
        params: { query: params },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(params.sportSlug && params.stat),
  })
}

export function useTeamLeaderboard(params: { sportSlug: string; stat: string; seasonId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['leaderboards', 'teams', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/leaderboards/teams', {
        params: { query: params },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(params.sportSlug && params.stat),
  })
}
