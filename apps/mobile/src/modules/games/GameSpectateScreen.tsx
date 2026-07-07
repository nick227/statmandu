import { ScrollView, View } from 'react-native'
import { Stack } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { GameScoreboardCard } from '@/modules/games/GameScoreboardCard'
import { useGameSpectate } from '@/modules/games/useGameSpectate'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'

export function GameSpectateScreen({ gameId }: { gameId: string }) {
  const { game, isLoading, recentEvents, score } = useGameSpectate(gameId)

  if (isLoading || !game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Watch Live' }} />
        <LoadingState />
      </>
    )
  }

  return (
    <ScrollView className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: true, title: 'Watch Live' }} />
      <GameScoreboardCard game={game} liveScoreByTeamId={score} />
      <View className="px-lg py-md">
        <ConnectedReactionBar targetType="GAME" targetId={gameId} />
      </View>
      <Text className="font-semibold px-lg pb-sm">Timeline</Text>
      <View className="px-lg gap-sm pb-xxl">
        {recentEvents.length === 0 ? (
          <Text variant="caption">No events yet.</Text>
        ) : (
          recentEvents.map((event) => (
            <Text key={event.id} variant="caption">
              {new Date(event.clientTimestamp).toLocaleTimeString()} · {event.type.replace(/_/g, ' ')}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  )
}
