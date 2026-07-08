import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { motion } from '@/lib/theme'
import { GameStatusBadge } from './GameStatusBadge'

type Game = components['schemas']['Game']

export interface GameScoreboardCardProps {
  game: Game
  liveScoreByTeamId?: Record<string, number>
  className?: string
}

// Pulses whenever its value actually changes — the live-feel cue for a
// score update, distinct from the box score's static numbers elsewhere.
function PulsingScore({ value }: { value: number }) {
  const scale = useSharedValue(1)
  const previous = useRef(value)

  useEffect(() => {
    if (previous.current !== value) {
      scale.value = withSequence(
        withTiming(1.3, { duration: motion.liveEventFeedbackMs / 2 }),
        withTiming(1, { duration: motion.liveEventFeedbackMs / 2 })
      )
      previous.current = value
    }
  }, [value, scale])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={animatedStyle}>
      <Text variant="statValue">{value}</Text>
    </Animated.View>
  )
}

// Scoreboard at top of the Game page and the Live Capture screen. Reads
// GameTeam.finalScore once finalized; a live snapshot's score map overrides
// it while the game is in progress (see useGameSnapshot in useLiveGames.ts).
export function GameScoreboardCard({ game, liveScoreByTeamId, className }: GameScoreboardCardProps) {
  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)

  const scoreFor = (teamId?: string, fallback?: number | null): number =>
    (teamId ? liveScoreByTeamId?.[teamId] : undefined) ?? fallback ?? 0

  return (
    <View className={className}>
      <View className="flex-row items-center justify-center gap-md py-sm">
        <GameStatusBadge status={game.status} />
      </View>
      <View className="flex-row items-center justify-between px-lg py-md">
        <View className="items-center flex-1 gap-xs">
          <Text className="font-semibold text-center" numberOfLines={1}>{home?.team?.name ?? 'Home'}</Text>
          <PulsingScore value={scoreFor(home?.teamId, home?.finalScore)} />
        </View>
        <Text variant="caption">VS</Text>
        <View className="items-center flex-1 gap-xs">
          <Text className="font-semibold text-center" numberOfLines={1}>{away?.team?.name ?? 'Away'}</Text>
          <PulsingScore value={scoreFor(away?.teamId, away?.finalScore)} />
        </View>
      </View>
    </View>
  )
}
