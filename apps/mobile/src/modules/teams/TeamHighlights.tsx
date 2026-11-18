import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Calendar, Trophy } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { useNativeColor } from '@/lib/theme'

type Game = components['schemas']['Game']
type TeamSeasonStat = components['schemas']['TeamSeasonStat']

export interface TeamHighlightsProps {
  currentSeasonStats?: TeamSeasonStat
  nextOrLastGame?: Game
  teamId: string
  className?: string
}

// Always-visible strip between the hero and the tabs, mirroring
// PlayerHighlights — "current team is first priority": a visitor sees the
// current record and next/last game before ever touching a tab or the
// season switcher (which only affects the tabs below).
export function TeamHighlights({ currentSeasonStats, nextOrLastGame, teamId, className }: TeamHighlightsProps) {
  const mutedTextColor = useNativeColor('mutedText')
  const brandColor = useNativeColor('brand')

  if (!currentSeasonStats && !nextOrLastGame) return null

  const opponent = nextOrLastGame?.gameTeams.find((gt) => gt.teamId !== teamId)?.team?.name

  return (
    <Animated.View entering={FadeInDown.duration(320).springify()} className={className ?? 'flex-row flex-wrap gap-sm px-lg pt-md'}>
      {currentSeasonStats ? (
        <Card className="flex-1">
          <CardContent className="gap-xs">
            <View className="flex-row items-center gap-xs">
              <Trophy size={14} color={brandColor} />
              <Text variant="caption">Record</Text>
            </View>
            <Text variant="statValue">{currentSeasonStats.wins}-{currentSeasonStats.losses}</Text>
            <Text variant="caption">{currentSeasonStats.seasonName}</Text>
          </CardContent>
        </Card>
      ) : null}

      {nextOrLastGame ? (
        <Link href={{ pathname: '/games/[gameId]', params: { gameId: nextOrLastGame.id } }} asChild>
          <Pressable className="flex-1">
            <Card>
              <CardContent className="gap-xs">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-xs">
                    <Calendar size={14} color={mutedTextColor} />
                    <Text variant="caption">{nextOrLastGame.status === 'FINAL' ? 'Last Game' : 'Next Game'}</Text>
                  </View>
                  <GameStatusBadge status={nextOrLastGame.status} />
                </View>
                <Text className="font-semibold" numberOfLines={1}>{opponent ? `vs ${opponent}` : 'Game'}</Text>
                <Text variant="caption">{new Date(nextOrLastGame.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
              </CardContent>
            </Card>
          </Pressable>
        </Link>
      ) : null}
    </Animated.View>
  )
}
