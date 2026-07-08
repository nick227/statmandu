import { useBulkCreatePlayers, usePlayers } from '@statman/sdk'

export function useAdminAthletes() {
  const bulkCreate = useBulkCreatePlayers()
  const players = usePlayers({ limit: 20 })
  return { bulkCreate, players }
}

