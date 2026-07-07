import { useMemo, useState } from 'react'
import { useGame, useGameStats } from '@statman/sdk'

const GAME_DETAIL_TABS = ['Box Score', 'Top Performers']

export function useGameDetail(gameId: string) {
  const [tab, setTab] = useState(GAME_DETAIL_TABS[0])

  const gameQuery = useGame(gameId)
  const statsQuery = useGameStats(gameId)
  const stats = statsQuery.data?.data ?? []

  const topPerformers = useMemo(
    () => [...stats].sort((a, b) => b.points - a.points).slice(0, 3),
    [stats]
  )

  return {
    tab,
    setTab,
    tabs: GAME_DETAIL_TABS,
    game: gameQuery.data?.data,
    stats,
    topPerformers,
    isLoading: gameQuery.isLoading,
  }
}
