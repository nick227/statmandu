import { useQuery } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/sports')
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    staleTime: 5 * 60_000,
  })
}

export function useLeagues(params?: { sportSlug?: string }) {
  return useQuery({
    queryKey: ['leagues', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/leagues', { params: { query: params } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useLeague(leagueSlug: string) {
  return useQuery({
    queryKey: ['league', leagueSlug],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/leagues/{leagueSlug}', {
        params: { path: { leagueSlug } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(leagueSlug),
  })
}
