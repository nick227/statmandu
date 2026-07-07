import { useTeams } from '@statman/sdk'

export function useTeamsIndex() {
  const teamsQuery = useTeams()

  return {
    teams: teamsQuery.data?.data ?? [],
    isLoading: teamsQuery.isLoading,
  }
}
