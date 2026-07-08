import { View, Platform, useWindowDimensions } from 'react-native'
import { Stack } from 'expo-router'
import { useSportTheme } from '@/lib/theme'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { YouTubePlayer } from '@/shared/media/YouTubePlayer'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { GamePlayByPlay } from '@/modules/games/GamePlayByPlay'
import { ReporterPresencePill } from '@/modules/live-scoring/ReporterPresencePill'
import { useBroadcastDisplay } from '@/modules/live-scoring/useBroadcastDisplay'
import { Text } from '@/shared/ui/Text'
import { FloatingReactionsOverlay } from '@/modules/live-scoring/FloatingReactionsOverlay'
import { SpectatorReactionToolbar } from '@/modules/live-scoring/SpectatorReactionToolbar'

// Public, read-only, meant for a second/larger device (venue TV, propped-up
// tablet, stream overlay) — not a casting protocol, just a big-type view of
// the same poll-based snapshot the scorer's own screen already uses. No
// backend change: useGameSnapshot already returns score + recentEvents +
// reporterCount and already polls every 4s.
export function BroadcastDisplayScreen({ gameId }: { gameId: string }) {
  const { game, isError, isLoading, recentEvents, recentReactions, recentImageAssets, recentMediaAssets, reporterCount, score, youtubeVideoId } = useBroadcastDisplay(gameId)
  const sportTheme = useSportTheme(game?.sport?.slug)
  const { width: screenWidth } = useWindowDimensions()
  const broadcastHeight = Math.round(screenWidth * (9 / 16))

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

      <FloatingReactionsOverlay reactions={recentReactions ?? []} />

      {youtubeVideoId ? (
        <View className="w-full bg-black items-center justify-center" style={{ height: broadcastHeight }}>
          {Platform.OS === 'web' ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <YouTubePlayer
              videoId={youtubeVideoId}
              autoplay
              mute
              mounted
              style={{ width: screenWidth, height: broadcastHeight }}
            />
          )}
        </View>
      ) : null}

      <View className={youtubeVideoId ? 'items-center gap-sm pt-md pb-md px-lg' : 'items-center gap-sm pt-xxl pb-lg px-lg'}>
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
          imageAssets={recentImageAssets}
          mediaAssets={recentMediaAssets}
          playerNameById={{}}
          teamNameById={Object.fromEntries(game.gameTeams.map((gt) => [gt.teamId, gt.team?.name ?? '']))}
          className="px-xl gap-sm pb-xxl"
          emptyTitle="No plays yet"
          emptyDescription="Plays will appear here as they're recorded."
        />
      </View>

      <SpectatorReactionToolbar gameId={gameId} />
    </View>
  )
}
