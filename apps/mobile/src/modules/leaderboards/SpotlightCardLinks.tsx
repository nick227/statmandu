import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Link } from 'expo-router'
import { formatStatValue, getSportDefinition } from '@statman/sports'
import { Badge } from '@/shared/ui/Badge'
import { Text } from '@/shared/ui/Text'
import { SpotlightCard, type SpotlightCardSize, type SpotlightStat } from '@/shared/ui/SpotlightCard'
import { useSportTheme } from '@/lib/theme'

type PlayerLeaderboardEntry = components['schemas']['PlayerLeaderboardEntry']
type TeamLeaderboardEntry = components['schemas']['TeamLeaderboardEntry']

function playerSpotlightStats(
  sportSlug: string,
  entry: PlayerLeaderboardEntry,
  size: SpotlightCardSize
): { stats?: SpotlightStat[]; footer?: ReactNode } {
  const sport = getSportDefinition(sportSlug)
  const statField = sport.playerStatFields[entry.stat]
  const primaryStat = {
    label: statField?.label ?? entry.stat,
    value: formatStatValue(sport, entry.stat, entry.value),
  }

  if (size === 'large') {
    return {
      stats: [
        { label: primaryStat.label, value: primaryStat.value },
        { label: 'Rank', value: `#${entry.rank}` },
      ],
    }
  }

  return {
    footer: (
      <View className="self-center rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
        <Text variant="caption" className="text-white/80">
          #{entry.rank} · {primaryStat.value} {primaryStat.label}
        </Text>
      </View>
    ),
  }
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
  const name = `${athleteProfile.firstName} ${athleteProfile.lastName}`
  const subtitle = [currentTeam?.name, position, classYear].filter(Boolean).join(' · ')
  const { stats, footer } = playerSpotlightStats(sportSlug, entry, size)
  const verified = athleteProfile.sourceStatus === 'VERIFIED_TEAM_ACCOUNT'

  return (
    <Link href={{ pathname: '/players/[playerId]', params: { playerId: entry.player.id } }} asChild>
      <SpotlightCard
        size={size}
        kind="athlete"
        eyebrow={eyebrow ?? (size === 'large' ? 'Season leader' : 'Ranked')}
        title={name}
        subtitle={subtitle}
        stats={stats}
        imageUri={athleteProfile.avatarUrl}
        badge={size === 'large' && verified ? <Badge tone="verified">Verified</Badge> : undefined}
        footer={footer}
        className={className}
        style={sportTheme}
      />
    </Link>
  )
}

function teamSpotlightStats(
  sportSlug: string,
  entry: TeamLeaderboardEntry,
  size: SpotlightCardSize
): { stats?: SpotlightStat[]; footer?: ReactNode } {
  const sport = getSportDefinition(sportSlug)
  const statField = sport.teamStatFields[entry.stat]
  const primaryStat = {
    label: statField?.label ?? entry.stat,
    value: formatStatValue(sport, entry.stat, entry.value),
  }

  if (size === 'large') {
    return {
      stats: [
        { label: primaryStat.label, value: primaryStat.value },
        { label: 'Rank', value: `#${entry.rank}` },
      ],
    }
  }

  return {
    footer: (
      <View className="self-center rounded-pill border border-white/10 bg-white/10 px-sm py-xs">
        <Text variant="caption" className="text-white/80">
          #{entry.rank} · {primaryStat.value} {primaryStat.label}
        </Text>
      </View>
    ),
  }
}

export function TeamSpotlightCardLink({
  entry,
  sportSlug,
  size,
  eyebrow,
  className,
}: {
  entry: TeamLeaderboardEntry
  sportSlug: string
  size: SpotlightCardSize
  eyebrow?: string
  className?: string
}) {
  const sportTheme = useSportTheme(entry.team.sport?.slug ?? sportSlug)
  const subtitle = [entry.team.league?.name, entry.team.city].filter(Boolean).join(' · ')
  const { stats, footer } = teamSpotlightStats(sportSlug, entry, size)

  return (
    <Link href={{ pathname: '/teams/[teamId]', params: { teamId: entry.team.id } }} asChild>
      <SpotlightCard
        size={size}
        kind="athlete"
        eyebrow={eyebrow ?? (size === 'large' ? 'Top team' : 'Ranked')}
        title={entry.team.name}
        subtitle={subtitle}
        stats={stats}
        imageUri={entry.team.logoUrl}
        footer={footer}
        className={className}
        style={sportTheme}
      />
    </Link>
  )
}
