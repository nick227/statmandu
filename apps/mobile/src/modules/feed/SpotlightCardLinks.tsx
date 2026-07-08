import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Link } from 'expo-router'
import { Badge } from '@/shared/ui/Badge'
import { SpotlightCard, type SpotlightCardSize, type SpotlightStat } from '@/shared/ui/SpotlightCard'
import { useSportTheme } from '@/lib/theme'

type Game = components['schemas']['Game']

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
