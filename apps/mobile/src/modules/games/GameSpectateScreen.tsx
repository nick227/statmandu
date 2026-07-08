import { Pressable, ScrollView, Share, View } from 'react-native'
import { Link, Stack } from 'expo-router'
import { formatStatValue, getSportDefinition } from '@statman/sports'
import { Share2 } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useNativeColor, useSportTheme } from '@/lib/theme'
import { GameScoreboardCard } from '@/modules/games/GameScoreboardCard'
import { GamePlayByPlay } from '@/modules/games/GamePlayByPlay'
import { useGameSpectate } from '@/modules/games/useGameSpectate'
import { readSportStat } from '@/modules/sports'
import { ConnectedFollowButton } from '@/modules/social/ConnectedFollowButton'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'

export function GameSpectateScreen({ gameId }: { gameId: string }) {
  const { game, isError, isLoading, recentEvents, score, topPerformerStat, topPerformers } = useGameSpectate(gameId)
  const sportTheme = useSportTheme(game?.sport?.slug)
  const mutedTextColor = useNativeColor('mutedText')

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Watch Live' }} />
        <ErrorState message="This game couldn't be loaded." />
      </>
    )
  }

  if (isLoading || !game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Watch Live' }} />
        <LoadingState />
      </>
    )
  }

  return (
    <ScrollView className="flex-1 bg-canvas" style={sportTheme}>
      <Stack.Screen options={{ headerShown: true, title: 'Watch Live' }} />
      <GameScoreboardCard game={game} liveScoreByTeamId={score} />
      <View className="gap-md px-lg py-md">
        <View className="flex-row items-center justify-between gap-md">
          <ConnectedReactionBar targetType="GAME" targetId={gameId} />
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
            hitSlop={8}
            onPress={() => Share.share({ message: `${game.gameTeams.map((gt) => gt.team?.name).filter(Boolean).join(' vs ')} on Statman` })}
          >
            <Share2 size={18} color={mutedTextColor} />
          </Pressable>
        </View>
        <View className="flex-row gap-sm">
          {game.gameTeams.map((gt) => (
            <ConnectedFollowButton key={gt.teamId} targetType="TEAM" targetId={gt.teamId} className="flex-1" />
          ))}
        </View>
      </View>
      {topPerformers.length > 0 ? (
        <View className="gap-sm px-lg pb-md">
          <Text className="font-semibold">Top Performers</Text>
          {topPerformers.map((line, index) => {
            const sport = getSportDefinition(game.sport?.slug ?? 'basketball')
            const statField = sport.playerStatFields[topPerformerStat]
            const statValue = formatStatValue(sport, topPerformerStat, Number(readSportStat(game.sport?.slug ?? 'basketball', line, topPerformerStat) ?? 0))
            return (
              <View key={line.id} className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md">
                <Text className="w-7 text-center font-semibold text-sport-accent">#{index + 1}</Text>
                <Link href={{ pathname: '/players/[playerId]', params: { playerId: line.playerId } }} asChild>
                  <Pressable className="flex-1 active:opacity-70">
                    <Text className="font-semibold" numberOfLines={1}>{line.playerName}</Text>
                    <Text variant="caption" numberOfLines={1}>
                      {statValue} {statField?.label ?? topPerformerStat}
                    </Text>
                  </Pressable>
                </Link>
                <ConnectedFollowButton targetType="PLAYER" targetId={line.playerId} />
              </View>
            )
          })}
        </View>
      ) : null}
      <Text className="font-semibold px-lg pb-sm">Timeline</Text>
      <GamePlayByPlay
        sport={game.sport?.slug ?? 'basketball'}
        events={recentEvents}
        playerNameById={{}}
        teamNameById={Object.fromEntries(game.gameTeams.map((gt) => [gt.teamId, gt.team?.name ?? '']))}
        className="px-lg gap-sm pb-xxl"
        emptyTitle="No events yet"
        emptyDescription="Live events will appear here as reporters enter them."
      />
    </ScrollView>
  )
}
