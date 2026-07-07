import { FlatList, Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Radio } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Screen } from '@/shared/layout'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { useLiveScoringGames } from '@/modules/live-scoring/useLiveScoringGames'

export function LiveScoringIndexScreen() {
  const { games, isLoading } = useLiveScoringGames()

  return (
    <Screen title="Enter">
      {isLoading ? (
        <View className="gap-sm px-lg">
          {[0, 1].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(g) => g.id}
          contentContainerClassName="gap-sm px-lg pb-xxl"
          renderItem={({ item }) => (
            <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: item.id } }} asChild>
              <Pressable className="flex-row items-center justify-between rounded-md border border-border p-md">
                <View>
                  <Text className="font-semibold">
                    {item.gameTeams.find((gt) => gt.isHome)?.team?.name} vs {item.gameTeams.find((gt) => !gt.isHome)?.team?.name}
                  </Text>
                  <Text variant="caption">{new Date(item.scheduledAt).toLocaleString()}</Text>
                </View>
                <GameStatusBadge status={item.status} />
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={
            <EmptyState icon={Radio} title="No games to enter" description="Scheduled and live games you can score will show up here." />
          }
        />
      )}
    </Screen>
  )
}
