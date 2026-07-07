import { View } from 'react-native'
import { Link, Stack } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Button } from '@/shared/ui/Button'
import { Sheet, SheetScrollView } from '@/shared/ui/Sheet'
import { EntityProfileTabs } from '@/shared/layout/entity-profile/EntityProfileTabs'
import { GameBoxScoreTable } from '@/modules/games/GameBoxScoreTable'
import { GameScoreboardCard } from '@/modules/games/GameScoreboardCard'
import { useGameDetail } from '@/modules/games/useGameDetail'

export function GameDetailScreen({ gameId }: { gameId: string }) {
  const gameState = useGameDetail(gameId)

  if (gameState.isLoading || !gameState.game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Game' }} />
        <LoadingState />
      </>
    )
  }

  const { game, setTab, stats, tab, tabs, topPerformers } = gameState
  const home = game.gameTeams.find((gt) => gt.isHome)?.team?.name
  const away = game.gameTeams.find((gt) => !gt.isHome)?.team?.name

  return (
    <View className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: true, title: home && away ? `${home} vs ${away}` : 'Game' }} />
      <GameScoreboardCard game={game} />

      <View className="flex-row gap-sm px-lg pb-sm">
        {game.status === 'SCHEDULED' || game.status === 'LIVE' ? (
          <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: game.id } }} asChild>
            <Button size="sm">Enter Stats</Button>
          </Link>
        ) : null}
        <Link href={{ pathname: '/games/[gameId]/spectate', params: { gameId: game.id } }} asChild>
          <Button variant="secondary" size="sm">Watch Live</Button>
        </Link>
      </View>

      <Sheet snaps={['half', 'expanded']}>
        <EntityProfileTabs tabs={tabs} active={tab} onChange={setTab} />
        <SheetScrollView contentContainerClassName="pb-xxl">
          {tab === 'Box Score' ? (
            <GameBoxScoreTable
              lines={stats}
              playerNameById={{}}
            />
          ) : (
            <View className="px-lg gap-sm pt-sm">
              {topPerformers.length === 0 ? (
                <Text variant="caption">No finalized stats yet.</Text>
              ) : (
                topPerformers.map((line) => (
                  <Text key={line.id}>{line.points} PTS · {line.assists} AST · {line.offRebounds + line.defRebounds} REB</Text>
                ))
              )}
            </View>
          )}
        </SheetScrollView>
      </Sheet>
    </View>
  )
}
