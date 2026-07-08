import { useMemo } from 'react'
import { getSportDefinition } from '@statman/sports'
import { useGame, useGameSnapshot, useGameStats } from '@statman/sdk'
import { readSportStat } from '@/modules/sports'

export function useGameSpectate(gameId: string) {
  const gameQuery = useGame(gameId)
  const snapshotQuery = useGameSnapshot(gameId)
  const statsQuery = useGameStats(gameId)
  const game = gameQuery.data?.data
  const stats = statsQuery.data?.data ?? []
  const sport = game?.sport?.slug ?? 'basketball'
  const leaderboardKey = getSportDefinition(sport).views.leaderboard[0] ?? 'points'
  const score = Object.fromEntries((snapshotQuery.data?.data.score ?? []).map((s) => [s.teamId, s.points]))
  const topPerformers = useMemo(
    () => [...stats].sort((a, b) => Number(readSportStat(sport, b, leaderboardKey) ?? 0) - Number(readSportStat(sport, a, leaderboardKey) ?? 0)).slice(0, 3),
    [leaderboardKey, sport, stats]
  )

  return {
    game,
    recentEvents: snapshotQuery.data?.data.recentEvents ?? [],
    score,
    stats,
    topPerformers,
    topPerformerStat: leaderboardKey,
    isLoading: gameQuery.isLoading || snapshotQuery.isLoading || statsQuery.isLoading,
    isError: gameQuery.isError || snapshotQuery.isError || statsQuery.isError,
  }
}
