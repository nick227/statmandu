import { useMemo, useState } from 'react'
import type { components } from '@statman/sdk'
import { getSportDefinition } from '@statman/sports'
import { useGames, usePlayerLeaderboard, useRecentMedia, useTeamLeaderboard } from '@statman/sdk'
import { EXPLORE_SPORTS, type ExploreSportSlug } from '@/modules/leaderboards/exploreContent'
import type { ShowcaseList } from '@/modules/leaderboards/showcaseTypes'

type Game = components['schemas']['Game']
type PlayerLeaderboardEntry = components['schemas']['PlayerLeaderboardEntry']

function gameScore(game: Game) {
  const scores = game.gameTeams.map((gt) => gt.finalScore ?? 0)
  const total = scores.reduce((sum, score) => sum + score, 0)
  const margin = scores.length >= 2 ? Math.abs(scores[0]! - scores[1]!) : 0
  return { total, margin }
}

function classYearNumber(entry: PlayerLeaderboardEntry) {
  return Number(entry.player.classYear?.match(/\d{4}/)?.[0] ?? 0)
}

export function useExploreRankings() {
  const [sportSlug, setSportSlug] = useState<ExploreSportSlug>('basketball')
  const [playerStat, setPlayerStat] = useState('points')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const sport = getSportDefinition(sportSlug)
  const playerStats = sport.views.leaderboard
  const teamStat = sport.views.teamProfileHeadline[0] ?? 'wins'
  const activePlayerStat = playerStats.includes(playerStat) ? playerStat : playerStats[0] ?? 'points'
  const adjacentStats = playerStats.filter((stat) => stat !== activePlayerStat).slice(0, 2)
  const secondaryPlayerStat = adjacentStats[0] ?? activePlayerStat
  const tertiaryPlayerStat = adjacentStats[1] ?? secondaryPlayerStat

  const playersQuery = usePlayerLeaderboard({ sportSlug, stat: activePlayerStat, limit: 8 })
  const secondaryPlayersQuery = usePlayerLeaderboard({ sportSlug, stat: secondaryPlayerStat, limit: 6 })
  const tertiaryPlayersQuery = usePlayerLeaderboard({ sportSlug, stat: tertiaryPlayerStat, limit: 6 })
  const teamsQuery = useTeamLeaderboard({ sportSlug, stat: teamStat, limit: 6 })
  const gamesQuery = useGames()
  const recentMediaQuery = useRecentMedia(20)

  const filterVerified = useMemo(() => {
    return (entries: NonNullable<typeof playersQuery.data>['data']) => {
      if (!verifiedOnly) return entries
      return entries.filter((entry) => entry.player.athleteProfile.sourceStatus === 'VERIFIED_TEAM_ACCOUNT')
    }
  }, [verifiedOnly])

  const playerEntries = useMemo(
    () => filterVerified(playersQuery.data?.data ?? []),
    [filterVerified, playersQuery.data?.data]
  )
  const secondaryPlayerEntries = useMemo(
    () => filterVerified(secondaryPlayersQuery.data?.data ?? []),
    [filterVerified, secondaryPlayersQuery.data?.data]
  )
  const tertiaryPlayerEntries = useMemo(
    () => filterVerified(tertiaryPlayersQuery.data?.data ?? []),
    [filterVerified, tertiaryPlayersQuery.data?.data]
  )

  const teamEntries = teamsQuery.data?.data ?? []
  const sportGames = useMemo(
    () => (gamesQuery.data?.data ?? []).filter((game) => (game.sport?.slug ?? sportSlug) === sportSlug),
    [gamesQuery.data?.data, sportSlug]
  )
  const featuredPlayer = playerEntries[0] ?? null
  const risingPlayers = useMemo(() => (featuredPlayer ? playerEntries.slice(1) : playerEntries), [featuredPlayer, playerEntries])
  const featuredTeam = teamEntries[0] ?? null
  const risingTeams = useMemo(() => (featuredTeam ? teamEntries.slice(1) : teamEntries), [featuredTeam, teamEntries])

  const isVerifiedFilterEmpty = verifiedOnly && !playersQuery.isLoading && !playersQuery.isError && playerEntries.length === 0
  const verifiedPlayers = useMemo(
    () => playerEntries.filter((entry) => entry.player.athleteProfile.sourceStatus === 'VERIFIED_TEAM_ACCOUNT').slice(0, 6),
    [playerEntries]
  )
  const underclassLeaders = useMemo(
    () => [...playerEntries].filter((entry) => classYearNumber(entry) > 0).sort((a, b) => classYearNumber(b) - classYearNumber(a)).slice(0, 6),
    [playerEntries]
  )
  const veteranLeaders = useMemo(
    () => [...playerEntries].filter((entry) => classYearNumber(entry) > 0).sort((a, b) => classYearNumber(a) - classYearNumber(b)).slice(0, 6),
    [playerEntries]
  )
  const liveGames = useMemo(() => sportGames.filter((game) => game.status === 'LIVE').slice(0, 3), [sportGames])
  const upcomingGames = useMemo(
    () => sportGames
      .filter((game) => game.status === 'SCHEDULED')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 3),
    [sportGames]
  )
  const finalGames = useMemo(() => sportGames.filter((game) => game.status === 'FINAL'), [sportGames])
  const highTotalGames = useMemo(
    () => [...finalGames].sort((a, b) => gameScore(b).total - gameScore(a).total).slice(0, 3),
    [finalGames]
  )
  const closeFinishGames = useMemo(
    () => [...finalGames].filter((game) => gameScore(game).margin > 0).sort((a, b) => gameScore(a).margin - gameScore(b).margin).slice(0, 3),
    [finalGames]
  )
  const statementGames = useMemo(
    () => [...finalGames].sort((a, b) => gameScore(b).margin - gameScore(a).margin).slice(0, 3),
    [finalGames]
  )
  const recentFinals = useMemo(
    () => [...finalGames].sort((a, b) => new Date(b.finalizedAt ?? b.scheduledAt).getTime() - new Date(a.finalizedAt ?? a.scheduledAt).getTime()).slice(0, 3),
    [finalGames]
  )
  const showcaseLists: ShowcaseList[] = [
    {
      key: secondaryPlayerStat,
      kind: 'players' as const,
      title: sport.playerStatFields[secondaryPlayerStat]?.fullLabel ?? sport.playerStatFields[secondaryPlayerStat]?.label ?? secondaryPlayerStat,
      subtitle: 'A different lane for athletes changing the game.',
      entries: secondaryPlayerEntries,
    },
    {
      key: tertiaryPlayerStat,
      kind: 'players' as const,
      title: sport.playerStatFields[tertiaryPlayerStat]?.fullLabel ?? sport.playerStatFields[tertiaryPlayerStat]?.label ?? tertiaryPlayerStat,
      subtitle: 'Another category, another way to separate.',
      entries: tertiaryPlayerEntries,
    },
    { key: 'verified-standards', kind: 'players' as const, title: 'Verified Standards', subtitle: 'Leaders backed by team-account source quality.', entries: verifiedPlayers },
    { key: 'next-class', kind: 'players' as const, title: 'Next Class Watch', subtitle: 'Younger athletes already forcing the conversation.', entries: underclassLeaders },
    { key: 'veteran-board', kind: 'players' as const, title: 'Veteran Board', subtitle: 'Upper-class leaders with season command.', entries: veteranLeaders },
    { key: 'team-pace', kind: 'teams' as const, title: 'Team Pace Setters', subtitle: 'Programs setting the table in the standings.', entries: teamEntries },
    { key: 'live-wire', kind: 'games' as const, title: 'Live Wire', subtitle: 'Games happening now, one tap from the spectator surface.', entries: liveGames },
    { key: 'next-up', kind: 'games' as const, title: 'Next Up', subtitle: 'Upcoming matchups with room to become the next story.', entries: upcomingGames },
    { key: 'scoreboard-fireworks', kind: 'games' as const, title: 'Scoreboard Fireworks', subtitle: 'Highest combined totals from finalized games.', entries: highTotalGames },
    { key: 'knife-edge', kind: 'games' as const, title: 'Knife-Edge Finishes', subtitle: 'The closest final margins on the board.', entries: closeFinishGames },
    { key: 'statement-wins', kind: 'games' as const, title: 'Statement Wins', subtitle: 'Biggest margins, loudest results.', entries: statementGames },
    { key: 'fresh-finals', kind: 'games' as const, title: 'Fresh Finals', subtitle: 'Most recent results feeding the rankings.', entries: recentFinals },
  ].filter((list, index, all) => list.entries.length > 0 && all.findIndex((candidate) => candidate.key === list.key) === index)

  const recentVideos = recentMediaQuery.data?.data ?? []
  const playerIds = useMemo(() => new Set(playerEntries.map((entry) => entry.player.id)), [playerEntries])
  const championVideo = useMemo(
    () => (featuredPlayer ? recentVideos.find((video) => video.targetType === 'PLAYER' && video.targetId === featuredPlayer.player.id) ?? null : null),
    [featuredPlayer, recentVideos]
  )
  const leaderVideos = useMemo(
    () => recentVideos.filter((video) => video.targetType === 'PLAYER' && playerIds.has(video.targetId)).slice(0, 6),
    [playerIds, recentVideos]
  )
  const exploreViewerVideos = useMemo(() => {
    const list = championVideo ? [championVideo] : []
    for (const video of leaderVideos) {
      if (!list.some((entry) => entry.id === video.id)) list.push(video)
    }
    return list
  }, [championVideo, leaderVideos])

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
    secondaryPlayerEntries,
    tertiaryPlayerEntries,
    showcaseLists,
    featuredPlayer,
    risingPlayers,
    featuredTeam,
    risingTeams,
    hasPlayerResults: playerEntries.length > 0,
    hasTeamResults: teamEntries.length > 0,
    isVerifiedFilterEmpty,
    recentVideos,
    championVideo,
    leaderVideos,
    exploreViewerVideos,
    isLoading: playersQuery.isLoading || secondaryPlayersQuery.isLoading || tertiaryPlayersQuery.isLoading || teamsQuery.isLoading || gamesQuery.isLoading || recentMediaQuery.isLoading,
    isError: playersQuery.isError || secondaryPlayersQuery.isError || tertiaryPlayersQuery.isError || teamsQuery.isError || gamesQuery.isError || recentMediaQuery.isError,
  }
}
