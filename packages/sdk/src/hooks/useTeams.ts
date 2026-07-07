import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiClient, ApiError } from '../client'

export function useTeams(params?: { leagueSlug?: string }) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/teams', { params: { query: params } })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
  })
}

export function useTeam(teamSlug: string) {
  return useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/teams/{teamSlug}', {
        params: { path: { teamSlug } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(teamSlug),
  })
}

export function useTeamRoster(teamSlug: string) {
  return useQuery({
    queryKey: ['team', teamSlug, 'roster'],
    queryFn: async () => {
      const { data, error, response } = await getApiClient().GET('/teams/{teamSlug}/roster', {
        params: { path: { teamSlug } },
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    enabled: Boolean(teamSlug),
  })
}

export function useAddTeamRosterMember(teamId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { playerId: string; seasonId: string; jerseyNumber?: number }) => {
      const { data, error, response } = await getApiClient().POST('/teams/{teamId}/roster/members', {
        params: { path: { teamId } },
        body,
      })
      if (error) throw new ApiError(response.status, (error as any).error)
      return data!
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
