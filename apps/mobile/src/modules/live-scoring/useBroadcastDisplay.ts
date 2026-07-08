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
    recentReactions: snapshotQuery.data?.data.recentReactions ?? [],
    recentImageAssets: snapshotQuery.data?.data.recentImageAssets ?? [],
    recentMediaAssets: snapshotQuery.data?.data.recentMediaAssets ?? [],
    isLoading: gameQuery.isLoading,
    isError: gameQuery.isError || snapshotQuery.isError,
  }
}
