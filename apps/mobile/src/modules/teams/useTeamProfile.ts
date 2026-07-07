import { useState } from 'react'
import { useGames, useTeam, useTeamRoster } from '@statman/sdk'

const TEAM_PROFILE_TABS = ['Roster', 'Games', 'Stats']

export function useTeamProfile(teamId: string) {
  const [tab, setTab] = useState(TEAM_PROFILE_TABS[0])

  const teamQuery = useTeam(teamId)
  const rosterQuery = useTeamRoster(teamId)
  const gamesQuery = useGames({ teamSlug: teamQuery.data?.data.slug })

  const team = teamQuery.data?.data
  const roster = rosterQuery.data?.data ?? []

  return {
    tab,
    setTab,
    tabs: TEAM_PROFILE_TABS,
    team,
    roster,
    games: gamesQuery.data?.data ?? [],
    stats: [
      { label: 'Roster', value: roster.length },
      { label: 'League', value: team?.league?.name ?? '-' },
    ],
    isLoading: teamQuery.isLoading,
  }
}
