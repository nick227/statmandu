import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Flame, History } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { useNativeColor } from '@/lib/theme'

type Game = components['schemas']['Game']
type GameStatLine = components['schemas']['GameStatLine']

export interface PlayerHighlightsProps {
  lastGameLine?: GameStatLine
  lastGame?: Game
  seasonHighPoints: number | null
  className?: string
}

// Always-visible strip between the hero and the tabs — "hide complexity
// until asked" (brand guide) applies to the deep-dive tabs, not to the two
// things a visitor most wants at a glance: what happened last, and this
// player's best moment this season. Both computed from real data already
// on the profile — nothing here is fabricated.
export function PlayerHighlights({ lastGameLine, lastGame, seasonHighPoints, className }: PlayerHighlightsProps) {
  const mutedTextColor = useNativeColor('mutedText')
  const disputeColor = useNativeColor('dispute')

  if (!lastGameLine && seasonHighPoints == null) return null

  const opponent = lastGame?.gameTeams.find((gt) => gt.teamId !== lastGameLine?.teamId)?.team?.name
  const playedDate = lastGame ? new Date(lastGame.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null

  return (
    <Animated.View entering={FadeInDown.duration(320).springify()} className={className ?? 'flex-row gap-sm px-lg pt-md'}>
      {lastGameLine ? (
        <Link href={{ pathname: '/games/[gameId]', params: { gameId: lastGameLine.gameId } }} asChild>
          <Pressable className="flex-1">
            <Card>
              <CardContent className="gap-xs">
                <View className="flex-row items-center gap-xs">
                  <History size={14} color={mutedTextColor} />
                  <Text variant="caption">Last Game</Text>
                </View>
                <Text className="font-semibold" numberOfLines={1}>{opponent ? `vs ${opponent}` : 'Recent game'}</Text>
                <Text variant="caption">
                  {[playedDate, `${lastGameLine.points} PTS`, `${lastGameLine.assists} AST`].filter(Boolean).join(' · ')}
                </Text>
              </CardContent>
            </Card>
          </Pressable>
        </Link>
      ) : null}

      {seasonHighPoints != null ? (
        <Card className="flex-1">
          <CardContent className="gap-xs">
            <View className="flex-row items-center gap-xs">
              <Flame size={14} color={disputeColor} />
              <Text variant="caption">Season High</Text>
            </View>
            <Text variant="statValue">{seasonHighPoints}</Text>
            <Text variant="caption">Points in a game</Text>
          </CardContent>
        </Card>
      ) : null}
    </Animated.View>
  )
}
