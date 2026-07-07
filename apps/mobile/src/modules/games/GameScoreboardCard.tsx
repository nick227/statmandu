import { View } from 'react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { GameStatusBadge } from './GameStatusBadge'

type Game = components['schemas']['Game']

export interface GameScoreboardCardProps {
  game: Game
  liveScoreByTeamId?: Record<string, number>
  className?: string
}

// Scoreboard at top of the Game page and the Live Capture screen. Reads
// GameTeam.finalScore once finalized; a live snapshot's score map overrides
// it while the game is in progress (see useGameSnapshot in useLiveGames.ts).
export function GameScoreboardCard({ game, liveScoreByTeamId, className }: GameScoreboardCardProps) {
  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)

  const scoreFor = (teamId?: string, fallback?: number | null) =>
    (teamId && liveScoreByTeamId?.[teamId]) ?? fallback ?? 0

  return (
    <View className={className}>
      <View className="flex-row items-center justify-center gap-md py-sm">
        <GameStatusBadge status={game.status} />
      </View>
      <View className="flex-row items-center justify-between px-lg py-md">
        <View className="items-center flex-1 gap-xs">
          <Text className="font-semibold text-center" numberOfLines={1}>{home?.team?.name ?? 'Home'}</Text>
          <Text variant="statValue">{scoreFor(home?.teamId, home?.finalScore)}</Text>
        </View>
        <Text variant="caption">VS</Text>
        <View className="items-center flex-1 gap-xs">
          <Text className="font-semibold text-center" numberOfLines={1}>{away?.team?.name ?? 'Away'}</Text>
          <Text variant="statValue">{scoreFor(away?.teamId, away?.finalScore)}</Text>
        </View>
      </View>
    </View>
  )
}
