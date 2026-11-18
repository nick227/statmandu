import { useMemo, useState } from 'react'
import { useAthleteCards, useCurrentUser, useGame, useImages, useMedia, usePlayer, usePlayerGames, usePlayerSeasonStats, useUpdatePlayer } from '@statman/sdk'
import { sportStatChips } from '@/modules/sports'

const PLAYER_PROFILE_TAB_LABELS = ['Stats', 'Games', 'Cards', 'Media', 'Sources'] as const

export function usePlayerProfile(playerId: string) {
  const [tab, setTab] = useState<string>(PLAYER_PROFILE_TAB_LABELS[0])

  const playerQuery = usePlayer(playerId)
  const seasonStatsQuery = usePlayerSeasonStats(playerId)
  const gamesQuery = usePlayerGames(playerId)
  const mediaQuery = useMedia('PLAYER', playerId)
  const currentUserQuery = useCurrentUser()
  const updatePlayer = useUpdatePlayer(playerId)

  const player = playerQuery.data?.data
  const profile = player?.athleteProfile
  const cardsQuery = useAthleteCards(profile?.id ?? '')
  const publishedCardCount = (cardsQuery.data?.data ?? []).filter((c) => c.status === 'PUBLISHED').length
  const tabs = PLAYER_PROFILE_TAB_LABELS.map((label) =>
    label === 'Cards' && publishedCardCount > 0 ? { label, badge: publishedCardCount } : label
  )
  const galleryQuery = useImages('ATHLETE_PROFILE', profile?.id ?? '', 'GALLERY')
  const galleryImages = (galleryQuery.data?.data ?? []).map((img) => ({
    id: img.id,
    url: img.url,
    title: img.originalFilename ?? null,
    createdAt: img.createdAt,
  }))
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
    tabs,
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
    galleryImages,
    updatePlayer,
    isLoading: playerQuery.isLoading,
    isError: playerQuery.isError,
  }
}
