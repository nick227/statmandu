import { View } from 'react-native'
import { Stack } from 'expo-router'
import { useSportTheme } from '@/lib/theme'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { GamePlayByPlay } from '@/modules/games/GamePlayByPlay'
import { ReporterPresencePill } from '@/modules/live-scoring/ReporterPresencePill'
import { useBroadcastDisplay } from '@/modules/live-scoring/useBroadcastDisplay'

// Public, read-only, meant for a second/larger device (venue TV, propped-up
// tablet, stream overlay) — not a casting protocol, just a big-type view of
// the same poll-based snapshot the scorer's own screen already uses. No
// backend change: useGameSnapshot already returns score + recentEvents +
// reporterCount and already polls every 4s.
export function BroadcastDisplayScreen({ gameId }: { gameId: string }) {
  const { game, isError, isLoading, recentEvents, reporterCount, score } = useBroadcastDisplay(gameId)
  const sportTheme = useSportTheme(game?.sport?.slug)

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Broadcast' }} />
        <ErrorState message="This game couldn't be loaded." />
      </>
    )
  }

  if (isLoading || !game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Broadcast' }} />
        <LoadingState />
      </>
    )
  }

  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)
  const scoreFor = (teamId?: string, fallback?: number | null) => (teamId ? score[teamId] : undefined) ?? fallback ?? 0

  return (
    // `dark` forces every token-based class in this subtree (including ones
    // inside reused components like GamePlayByPlay/Badge) to resolve their
    // dark-mode CSS variable regardless of the device's OS scheme — a
    // broadcast/jumbotron display should always be the bold dark look, not
    // flip to a light background if someone's phone happens to be in light
    // mode. Same variable-scoping mechanism useSportTheme() already relies on.
    <View className="dark flex-1 bg-canvas" style={sportTheme}>
      <Stack.Screen options={{ headerShown: false, title: 'Broadcast' }} />

      <View className="items-center gap-sm pt-xxl pb-lg px-lg">
        <View className="flex-row items-center gap-md">
          <GameStatusBadge status={game.status} />
          <ReporterPresencePill count={reporterCount} />
        </View>
      </View>

      <View className="flex-row items-center justify-between px-xl">
        <View className="flex-1 items-center gap-sm">
          <Text className="text-white text-2xl font-bold text-center" numberOfLines={1}>{home?.team?.name ?? 'Home'}</Text>
          <Text className="text-white font-bold text-[96px] leading-[100px]">{scoreFor(home?.teamId, home?.finalScore)}</Text>
        </View>
        <Text className="text-white/40 text-xl font-semibold px-md">VS</Text>
        <View className="flex-1 items-center gap-sm">
          <Text className="text-white text-2xl font-bold text-center" numberOfLines={1}>{away?.team?.name ?? 'Away'}</Text>
          <Text className="text-white font-bold text-[96px] leading-[100px]">{scoreFor(away?.teamId, away?.finalScore)}</Text>
        </View>
      </View>

      <View className="flex-1 pt-xxl">
        <Text className="text-white/70 font-semibold px-xl pb-sm text-lg">Recent Plays</Text>
        <GamePlayByPlay
          sport={game.sport?.slug ?? 'basketball'}
          events={[...recentEvents].reverse()}
          playerNameById={{}}
          teamNameById={Object.fromEntries(game.gameTeams.map((gt) => [gt.teamId, gt.team?.name ?? '']))}
          className="px-xl gap-sm pb-xxl"
          emptyTitle="No plays yet"
          emptyDescription="Plays will appear here as they're recorded."
        />
      </View>
    </View>
  )
}
