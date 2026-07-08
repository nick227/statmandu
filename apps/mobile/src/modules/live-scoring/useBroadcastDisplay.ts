import { useGame, useGameSnapshot } from '@statman/sdk'

export function useBroadcastDisplay(gameId: string) {
  const gameQuery = useGame(gameId)
  const snapshotQuery = useGameSnapshot(gameId)

  return {
    game: gameQuery.data?.data,
    youtubeVideoId: snapshotQuery.data?.data.youtubeVideoId,
    score: Object.fromEntries((snapshotQuery.data?.data.score ?? []).map((s) => [s.teamId, s.points])),
    reporterCount: snapshotQuery.data?.data.reporterCount ?? 1,
    recentEvents: snapshotQuery.data?.data.recentEvents ?? [],
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError || snapshotQuery.isError,
  }
}
