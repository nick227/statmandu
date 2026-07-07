import { useGame, useGameSnapshot } from '@statman/sdk'

export function useGameSpectate(gameId: string) {
  const gameQuery = useGame(gameId)
  const snapshotQuery = useGameSnapshot(gameId)
  const score = Object.fromEntries((snapshotQuery.data?.data.score ?? []).map((s) => [s.teamId, s.points]))

  return {
    game: gameQuery.data?.data,
    recentEvents: snapshotQuery.data?.data.recentEvents ?? [],
    score,
    isLoading: gameQuery.isLoading,
  }
}
