import { View } from 'react-native'
import { Stack } from 'expo-router'
import { useSportTheme } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { useBroadcastDisplay } from '@/modules/live-scoring/useBroadcastDisplay'

// Transparent overlay meant to be used as a Browser Source in OBS or vMix.
// Displays a sleek, lower-third score bug powered by the same live snapshot
// as the main Broadcast/Gamecast view.
export function OverlayScorebugScreen({ gameId }: { gameId: string }) {
  const { game, isError, isLoading, score } = useBroadcastDisplay(gameId)
  const sportTheme = useSportTheme(game?.sport?.slug)

  if (isError || isLoading || !game) {
    return (
      <View className="flex-1 bg-transparent">
        <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
      </View>
    )
  }

  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)
  const scoreFor = (teamId?: string, fallback?: number | null) => (teamId ? score[teamId] : undefined) ?? fallback ?? 0

  return (
    <View className="dark flex-1 bg-transparent justify-end p-xl" style={sportTheme}>
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />

      <View className="flex-row items-center bg-canvas/90 rounded-xl overflow-hidden border border-border shadow-lg self-center mb-xl">
        {/* Away Team */}
        <View className="flex-row items-center px-xl py-md gap-lg flex-1 justify-end min-w-[250px]">
          <Text className="text-white text-3xl font-bold" numberOfLines={1}>{away?.team?.name ?? 'Away'}</Text>
          <Text className="text-white font-bold text-5xl">{scoreFor(away?.teamId, away?.finalScore)}</Text>
        </View>

        {/* Center Status */}
        <View className="items-center px-lg py-md bg-black/40 self-stretch justify-center min-w-[120px]">
          <GameStatusBadge status={game.status} />
        </View>

        {/* Home Team */}
        <View className="flex-row items-center px-xl py-md gap-lg flex-1 justify-start min-w-[250px]">
          <Text className="text-white font-bold text-5xl">{scoreFor(home?.teamId, home?.finalScore)}</Text>
          <Text className="text-white text-3xl font-bold" numberOfLines={1}>{home?.team?.name ?? 'Home'}</Text>
        </View>
      </View>
    </View>
  )
}
