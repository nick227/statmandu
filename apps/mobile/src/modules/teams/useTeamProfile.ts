import { useState } from 'react'
import { useGames, useMedia, useTeam, useTeamRoster, useTeamSeasonStats } from '@statman/sdk'
import { sportStatChips } from '@/modules/sports'

const TEAM_PROFILE_TABS = ['Roster', 'Games', 'Stats', 'Media', 'Sources']

export function useTeamProfile(teamId: string) {
  const [tab, setTab] = useState(TEAM_PROFILE_TABS[0])

  const teamQuery = useTeam(teamId)
  const rosterQuery = useTeamRoster(teamId)
  const statsQuery = useTeamSeasonStats(teamId)
  const gamesQuery = useGames({ teamSlug: teamQuery.data?.data.slug })
  const mediaQuery = useMedia('TEAM', teamId)

  const team = teamQuery.data?.data
  const roster = rosterQuery.data?.data ?? []
  const media = mediaQuery.data?.data ?? []
  const seasonStats = statsQuery.data?.data ?? []
  const currentSeasonStats = seasonStats[0]
  const sport = team?.sport?.slug ?? 'basketball'

  return {
    tab,
    setTab,
    tabs: TEAM_PROFILE_TABS,
    team,
    roster,
    media,
    primaryVideo: media[0],
    games: gamesQuery.data?.data ?? [],
    seasonStats,
    currentSeasonStats,
    stats: currentSeasonStats
      ? sportStatChips(sport, currentSeasonStats, 'teamProfileHeadline')
      : [
          { label: 'Roster', value: roster.length },
          { label: 'League', value: team?.league?.name ?? '-' },
        ],
    isLoading: teamQuery.isLoading || statsQuery.isLoading,
    isError: teamQuery.isError || statsQuery.isError,
  }
}
