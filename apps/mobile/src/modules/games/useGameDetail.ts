import { useMemo, useState } from 'react'
import { useGame, useGameEvents, useGameStats, useMedia } from '@statman/sdk'
import { getSportDefinition } from '@statman/sports'
import { readSportStat } from '@/modules/sports'

const GAME_DETAIL_TABS = ['Play by Play', 'Box Score', 'Top Performers', 'Media', 'Sources']

export function useGameDetail(gameId: string) {
  const [tab, setTab] = useState(GAME_DETAIL_TABS[0])

  const gameQuery = useGame(gameId)
  const statsQuery = useGameStats(gameId)
  const eventsQuery = useGameEvents(gameId)
  const mediaQuery = useMedia('GAME', gameId)
  const game = gameQuery.data?.data
  const stats = statsQuery.data?.data ?? []
  const events = eventsQuery.data?.data ?? []
  const sport = game?.sport?.slug ?? 'basketball'
  const leaderboardKey = getSportDefinition(sport).views.leaderboard[0] ?? 'points'

  const topPerformers = useMemo(
    () => [...stats].sort((a, b) => Number(readSportStat(sport, b, leaderboardKey) ?? 0) - Number(readSportStat(sport, a, leaderboardKey) ?? 0)).slice(0, 3),
    [leaderboardKey, sport, stats]
  )

  // Events only carry raw IDs — resolve names from data already fetched on
  // this page rather than adding another backend join.
  const playerNameById = useMemo(() => Object.fromEntries(stats.map((row) => [row.playerId, row.playerName])), [stats])
  const teamNameById = useMemo(
    () => Object.fromEntries((game?.gameTeams ?? []).map((gt) => [gt.teamId, gt.team?.name ?? ''])),
    [game]
  )

  return {
    tab,
    setTab,
    tabs: GAME_DETAIL_TABS,
    game,
    stats,
    events,
    playerNameById,
    teamNameById,
    topPerformers,
    media: mediaQuery.data?.data ?? [],
    isLoading: gameQuery.isLoading || statsQuery.isLoading || eventsQuery.isLoading || mediaQuery.isLoading,
    isError: gameQuery.isError || statsQuery.isError || eventsQuery.isError || mediaQuery.isError,
  }
}
