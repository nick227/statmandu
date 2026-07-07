import { FlatList, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { Radio } from 'lucide-react-native'
import { useGames } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { GameStatusBadge } from '@/components/domain'

// Enter — surface 8. Fast entry point into live scoring for games a
// scorekeeper/broadcaster/spectator-reporter can join. Manual post-game
// corrections happen on the Game page itself (Enter Stats there re-opens
// the same live-capture flow) rather than a separate form, per docs:
// "Enter: fast stat and media input: live scoring, post-game stats..."
export default function EnterScreen() {
  const insets = useSafeAreaInsets()
  const { data, isLoading } = useGames({ status: 'SCHEDULED' })
  const liveGames = useGames({ status: 'LIVE' })

  const games = [...(liveGames.data?.data ?? []), ...(data?.data ?? [])]

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <Text variant="entityName" className="px-lg pt-md pb-sm">Enter</Text>
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
    </View>
  )
}
