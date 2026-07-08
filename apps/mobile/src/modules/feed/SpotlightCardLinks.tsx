import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Link } from 'expo-router'
import { formatStatValue, getSportDefinition } from '@statman/sports'
import { Badge } from '@/shared/ui/Badge'
import { Text } from '@/shared/ui/Text'
import { SpotlightCard, type SpotlightCardSize, type SpotlightStat } from '@/shared/ui/SpotlightCard'
import { useSportTheme } from '@/lib/theme'

type PlayerLeaderboardEntry = components['schemas']['PlayerLeaderboardEntry']
type Game = components['schemas']['Game']

const FEATURED_ATHLETE_STATS: Record<string, SpotlightStat[]> = {
  // Mock headline stats for the hero card — real rank + primary stat come from API.
  default: [
    { label: 'PPG', value: '22.4' },
    { label: 'REB', value: '6.1' },
    { label: 'AST', value: '4.8' },
  ],
}

export function AthleteSpotlightCardLink({
  entry,
  sportSlug,
  size,
  eyebrow,
  className,
}: {
  entry: PlayerLeaderboardEntry
  sportSlug: string
  size: SpotlightCardSize
  eyebrow?: string
  className?: string
}) {
  const sportTheme = useSportTheme(entry.player.sport?.slug ?? sportSlug)
  const { athleteProfile, currentTeam, position, classYear } = entry.player
  const sport = getSportDefinition(sportSlug)
  const statField = sport.playerStatFields[entry.stat]
  const name = `${athleteProfile.firstName} ${athleteProfile.lastName}`
  const subtitle = [currentTeam?.name, position, classYear].filter(Boolean).join(' · ')
  const primaryStat = { label: statField?.label ?? entry.stat, value: formatStatValue(sport, entry.stat, entry.value) }
  const stats = size === 'large' ? FEATURED_ATHLETE_STATS.default : undefined
  const footer = size === 'small' ? (
    <View className="rounded-pill border border-white/10 bg-white/10 px-sm py-xs self-center">
      <Text variant="caption" className="text-white/80">#{entry.rank} · {primaryStat.value} {primaryStat.label}</Text>
    </View>
  ) : undefined

  return (
    <Link href={{ pathname: '/players/[playerId]', params: { playerId: entry.player.id } }} asChild>
      <SpotlightCard
        size={size}
        kind="athlete"
        eyebrow={eyebrow ?? (size === 'large' ? 'Featured Athlete' : 'Rising')}
        title={name}
        subtitle={subtitle}
        stats={stats}
        imageUri={athleteProfile.avatarUrl}
        badge={size === 'large' ? <Badge tone="verified">Verified stats</Badge> : undefined}
        footer={footer}
        className={className}
        style={sportTheme}
      />
    </Link>
  )
}

function gameTeams(game: Game) {
  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)
  return { home, away, homeName: home?.team?.name ?? 'Home', awayName: away?.team?.name ?? 'Away' }
}

function gameStatusLabel(status: Game['status']) {
  switch (status) {
    case 'LIVE': return 'Live now'
    case 'FINAL': return 'Final'
    case 'SCHEDULED': return 'Upcoming'
    default: return status.replace(/_/g, ' ')
  }
}

export function GameSpotlightCardLink({
  game,
  size,
  eyebrow,
  className,
}: {
  game: Game
  size: SpotlightCardSize
  eyebrow?: string
  className?: string
}) {
  const sportTheme = useSportTheme(game.sport?.slug)
  const { home, away, homeName, awayName } = gameTeams(game)
  const scheduled = new Date(game.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const title = `${homeName} vs ${awayName}`
  const subtitle = `${gameStatusLabel(game.status)} · ${scheduled}`
  const stats: SpotlightStat[] = [
    { label: homeName, value: String(home?.finalScore ?? (game.status === 'LIVE' ? '—' : '0')) },
    { label: awayName, value: String(away?.finalScore ?? (game.status === 'LIVE' ? '—' : '0')) },
  ]
  const tone = game.status === 'LIVE' ? 'live' as const : game.status === 'FINAL' ? 'verified' as const : 'muted-text' as const

  return (
    <Link href={{ pathname: '/games/[gameId]', params: { gameId: game.id } }} asChild>
      <SpotlightCard
        size={size}
        kind="game"
        eyebrow={eyebrow ?? (size === 'large' ? 'Big Game' : 'Game')}
        title={title}
        subtitle={subtitle}
        stats={stats}
        badge={<Badge tone={tone}>{gameStatusLabel(game.status)}</Badge>}
        className={className}
        style={sportTheme}
      />
    </Link>
  )
}
