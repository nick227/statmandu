import { useMemo, useState } from 'react'
import { getSportDefinition } from '@statman/sports'
import { usePlayerLeaderboard, useTeamLeaderboard } from '@statman/sdk'
import { EXPLORE_SPORTS, type ExploreSportSlug } from '@/modules/leaderboards/exploreContent'

export function useExploreRankings() {
  const [sportSlug, setSportSlug] = useState<ExploreSportSlug>('basketball')
  const [playerStat, setPlayerStat] = useState('points')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const sport = getSportDefinition(sportSlug)
  const playerStats = sport.views.leaderboard
  const teamStat = sport.views.teamProfileHeadline[0] ?? 'wins'
  const activePlayerStat = playerStats.includes(playerStat) ? playerStat : playerStats[0] ?? 'points'

  const playersQuery = usePlayerLeaderboard({ sportSlug, stat: activePlayerStat, limit: 8 })
  const teamsQuery = useTeamLeaderboard({ sportSlug, stat: teamStat, limit: 6 })

  const playerEntries = useMemo(() => {
    const entries = playersQuery.data?.data ?? []
    if (!verifiedOnly) return entries
    return entries.filter((entry) => entry.player.athleteProfile.sourceStatus === 'VERIFIED_TEAM_ACCOUNT')
  }, [playersQuery.data?.data, verifiedOnly])

  const teamEntries = teamsQuery.data?.data ?? []
  const featuredPlayer = playerEntries[0] ?? null
  const risingPlayers = useMemo(() => (featuredPlayer ? playerEntries.slice(1) : playerEntries), [featuredPlayer, playerEntries])
  const featuredTeam = teamEntries[0] ?? null
  const risingTeams = useMemo(() => (featuredTeam ? teamEntries.slice(1) : teamEntries), [featuredTeam, teamEntries])

  const isVerifiedFilterEmpty = verifiedOnly && !playersQuery.isLoading && !playersQuery.isError && playerEntries.length === 0

  return {
    sport,
    sportSlug,
    sportOptions: EXPLORE_SPORTS,
    setSportSlug,
    playerStat: activePlayerStat,
    setPlayerStat,
    playerStats,
    teamStat,
    verifiedOnly,
    setVerifiedOnly,
    playerEntries,
    teamEntries,
    featuredPlayer,
    risingPlayers,
    featuredTeam,
    risingTeams,
    hasPlayerResults: playerEntries.length > 0,
    hasTeamResults: teamEntries.length > 0,
    isVerifiedFilterEmpty,
    isLoading: playersQuery.isLoading || teamsQuery.isLoading,
    isError: playersQuery.isError || teamsQuery.isError,
  }
}
