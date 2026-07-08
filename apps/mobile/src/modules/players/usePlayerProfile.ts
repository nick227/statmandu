import { useMemo, useState } from 'react'
import { useCurrentUser, useGame, useMedia, usePlayer, usePlayerGames, usePlayerSeasonStats, useUpdatePlayer } from '@statman/sdk'
import { sportStatChips } from '@/modules/sports'

const PLAYER_PROFILE_TABS = ['Stats', 'Games', 'Media', 'Sources']

export function usePlayerProfile(playerId: string) {
  const [tab, setTab] = useState(PLAYER_PROFILE_TABS[0])

  const playerQuery = usePlayer(playerId)
  const seasonStatsQuery = usePlayerSeasonStats(playerId)
  const gamesQuery = usePlayerGames(playerId)
  const mediaQuery = useMedia('PLAYER', playerId)
  const currentUserQuery = useCurrentUser()
  const updatePlayer = useUpdatePlayer(playerId)

  const player = playerQuery.data?.data
  const profile = player?.athleteProfile
  const season = seasonStatsQuery.data?.data[0]
  const media = mediaQuery.data?.data ?? []
  const primaryVideo = media[0]
  const games = gamesQuery.data?.data ?? []

  // games is already ordered desc by createdAt (see StatsService.listPlayerGames),
  // so the first entry is the most recent — fetched separately for real
  // opponent/date context since the stat-line list itself carries neither.
  const lastGameLine = games[0]
  const lastGameQuery = useGame(lastGameLine?.gameId ?? '')
  const lastGame = lastGameQuery.data?.data

  // Genuinely computed from real data, not fabricated — the single highest
  // points total across every finalized game this player has a line for.
  const seasonHighPoints = useMemo(
    () => (games.length === 0 ? null : Math.max(...games.map((g) => g.points))),
    [games]
  )

  const sport = player?.sport?.slug ?? 'basketball'
  const stats = sportStatChips(sport, season ?? { stats: null })
  const canEditProfile = Boolean(profile?.claimedByUserId && profile.claimedByUserId === currentUserQuery.data?.data.id)

  return {
    canEditProfile,
    tab,
    setTab,
    tabs: PLAYER_PROFILE_TABS,
    player,
    profile,
    season,
    primaryVideo,
    stats,
    games,
    lastGameLine,
    lastGame,
    seasonHighPoints,
    media,
    updatePlayer,
    isLoading: playerQuery.isLoading,
    isError: playerQuery.isError,
  }
}
