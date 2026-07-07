import { ScrollView, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useGame, useGameSnapshot } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Spinner } from '@/components/ui/Spinner'
import { GameScoreboard, ReactionBar } from '@/components/domain'

// Spectator Game View — surface 7. Live score, timeline, reactions.
// Follow/share actions live on the Team/Player pages the spectator navigates
// to from here; this screen stays focused on the live moment.
export default function SpectateScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  const { data: gameRes, isLoading } = useGame(gameId)
  const { data: snapshot } = useGameSnapshot(gameId)

  if (isLoading || !gameRes) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Spinner />
      </View>
    )
  }

  const score = Object.fromEntries((snapshot?.data.score ?? []).map((s) => [s.teamId, s.points]))

  return (
    <ScrollView className="flex-1 bg-canvas">
      <GameScoreboard game={gameRes.data} liveScoreByTeamId={score} />
      <View className="px-lg py-md">
        <ReactionBar targetType="GAME" targetId={gameId} />
      </View>
      <Text className="font-semibold px-lg pb-sm">Timeline</Text>
      <View className="px-lg gap-sm pb-xxl">
        {(snapshot?.data.recentEvents ?? []).length === 0 ? (
          <Text variant="caption">No events yet.</Text>
        ) : (
          snapshot!.data.recentEvents.map((event) => (
            <Text key={event.id} variant="caption">
              {new Date(event.clientTimestamp).toLocaleTimeString()} · {event.type.replace(/_/g, ' ')}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  )
}
