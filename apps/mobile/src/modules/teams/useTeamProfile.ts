import { useState } from 'react'
import { useGames, useMedia, useTeam, useTeamRoster, useTeamSeasonStats } from '@statman/sdk'
import { sportStatChips } from '@/modules/sports'

const TEAM_PROFILE_TABS = ['Roster', 'Games', 'Stats', 'Media', 'Sources']

export function useTeamProfile(teamId: string) {
  const [tab, setTab] = useState(TEAM_PROFILE_TABS[0])
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(undefined)

  const teamQuery = useTeam(teamId)
  const statsQuery = useTeamSeasonStats(teamId)
  const seasonStats = statsQuery.data?.data ?? []
  // "Current" always means the backend's current-first entry (index 0, now
  // deterministically ordered — see StatsService.getTeamSeasonStats), never
  // whatever the switcher happens to be on. The switcher only changes what
  // the Roster/Games/Stats tabs display, not the always-visible identity
  // stat chips or the "current record" highlight.
  const currentSeasonStats = seasonStats[0]
  const effectiveSeasonId = selectedSeasonId ?? currentSeasonStats?.seasonId
  const selectedSeasonStats = seasonStats.find((s) => s.seasonId === effectiveSeasonId) ?? currentSeasonStats
  const availableSeasons = seasonStats.map((s) => ({ id: s.seasonId, label: s.seasonName }))

  const rosterQuery = useTeamRoster(teamId, effectiveSeasonId)
  const gamesQuery = useGames({ teamSlug: teamQuery.data?.data.slug, seasonId: effectiveSeasonId })
  // Separate from the switcher-scoped gamesQuery above — the "next/last
  // game" highlight is an always-current, always-visible moment (same rule
  // as currentSeasonStats), not something browsing a past season should
  // change. Dedupes against gamesQuery automatically (same React Query key)
  // whenever the switcher is already on the current season, which is the
  // default/common case.
  const currentGamesQuery = useGames({ teamSlug: teamQuery.data?.data.slug, seasonId: currentSeasonStats?.seasonId })
  const mediaQuery = useMedia('TEAM', teamId)

  const team = teamQuery.data?.data
  const roster = rosterQuery.data?.data ?? []
  const media = mediaQuery.data?.data ?? []
  const sport = team?.sport?.slug ?? 'basketball'
  const currentGames = currentGamesQuery.data?.data ?? []
  // listGames orders scheduledAt desc, so the first FINAL entry is the
  // most recently played, not the earliest.
  const nextOrLastGame =
    currentGames.find((g) => g.status === 'SCHEDULED' || g.status === 'LIVE') ??
    currentGames.find((g) => g.status === 'FINAL')

  return {
    tab,
    setTab,
    tabs: TEAM_PROFILE_TABS,
    selectedSeasonId: effectiveSeasonId,
    setSelectedSeasonId,
    availableSeasons,
    team,
    roster,
    media,
    primaryVideo: media[0],
    games: gamesQuery.data?.data ?? [],
    seasonStats,
    currentSeasonStats,
    selectedSeasonStats,
    nextOrLastGame,
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
