import { useMemo } from 'react'
import { useFeed, useGames, usePlayerLeaderboard, useTeamLeaderboard } from '@statman/sdk'
import type { ShowcaseList } from '@/modules/leaderboards/showcaseTypes'
import {
  HOME_AD_SLOTS,
  HOME_AUTHORITY,
  HOME_COMMUNITY_METRICS,
  HOME_LAYOUT,
  HOME_MOCK_ACTIVITY,
  HOME_PLATFORM_PITCH,
  HOME_PLAYER_STAT,
  HOME_SECTION_COPY,
  HOME_SPORT_SLUG,
  HOME_TEAM_STAT,
  HOME_USAGE_CTAS,
} from '@/modules/feed/homeContent'

export function useHomeFeed() {
  const feedQuery = useFeed()
  const playerLeaderboardQuery = usePlayerLeaderboard({ sportSlug: HOME_SPORT_SLUG, stat: HOME_PLAYER_STAT, limit: 8 })
  const reboundLeadersQuery = usePlayerLeaderboard({ sportSlug: HOME_SPORT_SLUG, stat: 'rebounds', limit: 3 })
  const teamLeaderboardQuery = useTeamLeaderboard({ sportSlug: HOME_SPORT_SLUG, stat: HOME_TEAM_STAT, limit: 6 })
  const gamesQuery = useGames()

  const feedItems = feedQuery.data?.pages.flatMap((p) => p.data) ?? []
  const playerEntries = playerLeaderboardQuery.data?.data ?? []
  const teamEntries = teamLeaderboardQuery.data?.data ?? []
  const games = gamesQuery.data?.data ?? []

  const featuredAthlete = playerEntries[0] ?? null
  const podiumPlayers = useMemo(() => playerEntries.slice(0, 3), [playerEntries])
  const risingAthletes = useMemo(() => playerEntries.slice(3, 7), [playerEntries])

  const featuredTeam = teamEntries[0] ?? null
  const risingTeams = useMemo(() => teamEntries.slice(1, 5), [teamEntries])

  const featuredGame = useMemo(() => {
    const live = games.find((g) => g.status === 'LIVE')
    if (live) return live
    return games.find((g) => g.status === 'FINAL') ?? games[0] ?? null
  }, [games])

  const liveGames = useMemo(() => games.filter((g) => g.status === 'LIVE').slice(0, 3), [games])
  const recentGames = useMemo(
    () => games.filter((g) => g.id !== featuredGame?.id && g.status === 'FINAL').slice(0, 3),
    [featuredGame?.id, games]
  )

  const reboundShowcase: ShowcaseList | null = useMemo(() => {
    const entries = reboundLeadersQuery.data?.data ?? []
    if (entries.length === 0) return null
    return {
      key: 'rebounds',
      kind: 'players',
      title: HOME_SECTION_COPY.showcases.rebounds.title,
      subtitle: HOME_SECTION_COPY.showcases.rebounds.subtitle,
      entries,
    }
  }, [reboundLeadersQuery.data?.data])

  const liveShowcase: ShowcaseList | null = useMemo(() => {
    if (liveGames.length === 0) return null
    return {
      key: 'live',
      kind: 'games',
      title: HOME_SECTION_COPY.showcases.live.title,
      subtitle: HOME_SECTION_COPY.showcases.live.subtitle,
      entries: liveGames,
    }
  }, [liveGames])

  const communityActivity = useMemo(
    () => feedItems.slice(0, HOME_LAYOUT.maxFeedItems),
    [feedItems]
  )

  const mockActivity = useMemo(() => HOME_MOCK_ACTIVITY.slice(0, HOME_LAYOUT.maxMockActivity), [])

  const ads = HOME_AD_SLOTS

  return {
    authority: HOME_AUTHORITY,
    sectionCopy: HOME_SECTION_COPY,
    platformPitch: { ...HOME_PLATFORM_PITCH, compact: true },
    usageCtas: HOME_USAGE_CTAS,
    communityMetrics: HOME_COMMUNITY_METRICS,
    ads,
    featuredAthlete,
    podiumPlayers,
    risingAthletes,
    featuredTeam,
    risingTeams,
    featuredGame,
    recentGames,
    reboundShowcase,
    liveShowcase,
    communityActivity,
    mockActivity,
    layout: HOME_LAYOUT,
    isLoading: feedQuery.isLoading || playerLeaderboardQuery.isLoading || teamLeaderboardQuery.isLoading || gamesQuery.isLoading,
    isError: feedQuery.isError || playerLeaderboardQuery.isError || gamesQuery.isError,
  }
}
