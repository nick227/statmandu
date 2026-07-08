import { useMemo } from 'react'
import { useFeed, useGames, usePlayerLeaderboard, useTeamLeaderboard } from '@statman/sdk'
import {
  HOME_AUTHORITY,
  HOME_COMMUNITY_METRICS,
  HOME_PLATFORM_PITCH,
  HOME_SECTION_COPY,
  HOME_SPORT_SLUG,
  HOME_USAGE_CTAS,
} from '@/modules/feed/homeContent'

export function useHomeFeed() {
  const feedQuery = useFeed()
  const playerLeaderboardQuery = usePlayerLeaderboard({ sportSlug: HOME_SPORT_SLUG, stat: 'points', limit: 8 })
  const teamLeaderboardQuery = useTeamLeaderboard({ sportSlug: HOME_SPORT_SLUG, stat: 'wins', limit: 4 })
  const gamesQuery = useGames()

  const feedItems = feedQuery.data?.pages.flatMap((p) => p.data) ?? []
  const trendingPlayers = playerLeaderboardQuery.data?.data ?? []
  const leaderboardTeams = teamLeaderboardQuery.data?.data ?? []
  const games = gamesQuery.data?.data ?? []

  const featuredAthlete = trendingPlayers[0] ?? null
  const risingAthletes = useMemo(() => trendingPlayers.slice(1, 6), [trendingPlayers])

  const featuredGame = useMemo(() => {
    const live = games.find((g) => g.status === 'LIVE')
    if (live) return live
    return games.find((g) => g.status === 'FINAL') ?? games[0] ?? null
  }, [games])

  const recentGames = useMemo(
    () => games.filter((g) => g.id !== featuredGame?.id).slice(0, 4),
    [featuredGame?.id, games]
  )

  const communityActivity = feedItems

  return {
    authority: HOME_AUTHORITY,
    sectionCopy: HOME_SECTION_COPY,
    platformPitch: HOME_PLATFORM_PITCH,
    usageCtas: HOME_USAGE_CTAS,
    communityMetrics: HOME_COMMUNITY_METRICS,
    featuredAthlete,
    risingAthletes,
    featuredGame,
    recentGames,
    communityActivity,
    leaderboardTeams,
    isLoading: feedQuery.isLoading || playerLeaderboardQuery.isLoading || gamesQuery.isLoading,
    isError: feedQuery.isError || playerLeaderboardQuery.isError || gamesQuery.isError,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
  }
}
