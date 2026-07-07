import { useState } from 'react'
import { useMedia, usePlayer, usePlayerGames, usePlayerSeasonStats } from '@statman/sdk'

const PLAYER_PROFILE_TABS = ['Stats', 'Games', 'Media', 'Sources']

export function usePlayerProfile(playerId: string) {
  const [tab, setTab] = useState(PLAYER_PROFILE_TABS[0])

  const playerQuery = usePlayer(playerId)
  const seasonStatsQuery = usePlayerSeasonStats(playerId)
  const gamesQuery = usePlayerGames(playerId)
  const mediaQuery = useMedia('PLAYER', playerId)

  const player = playerQuery.data?.data
  const profile = player?.athleteProfile
  const season = seasonStatsQuery.data?.data[0]
  const primaryVideo = mediaQuery.data?.data[0]

  const stats = [
    { label: 'PPG', value: season ? (season.points / Math.max(season.gamesPlayed, 1)).toFixed(1) : '0.0' },
    { label: 'RPG', value: season ? ((season.offRebounds + season.defRebounds) / Math.max(season.gamesPlayed, 1)).toFixed(1) : '0.0' },
    { label: 'APG', value: season ? (season.assists / Math.max(season.gamesPlayed, 1)).toFixed(1) : '0.0' },
    { label: 'GP', value: season?.gamesPlayed ?? 0 },
  ]

  return {
    tab,
    setTab,
    tabs: PLAYER_PROFILE_TABS,
    player,
    profile,
    season,
    primaryVideo,
    stats,
    games: gamesQuery.data?.data ?? [],
    media: mediaQuery.data?.data ?? [],
    isLoading: playerQuery.isLoading,
  }
}
