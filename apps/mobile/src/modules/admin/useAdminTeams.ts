import { useBulkAddRosterMembers, useTeams } from '@statman/sdk'

export function useAdminTeams(teamId: string) {
  const teams = useTeams()
  const bulkAdd = useBulkAddRosterMembers(teamId)
  return { teams, bulkAdd }
}

