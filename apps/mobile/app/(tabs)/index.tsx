import { FlatList, View } from 'react-native'
import { Rss } from 'lucide-react-native'
import { useFeed } from '@statman/sdk'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/layout'
import { FeedItemCard } from '@/components/domain'

// Home — surface 1 (freshest content) and surface 13 (social feed) are the
// same underlying feed: fresh athlete/game/media activity, newest first.
// See docs/frontend-architecture.md "Route map" for why these consolidate.
export default function HomeScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage } = useFeed()
  const items = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <Screen title="Home">
      {isLoading ? (
        <View className="gap-sm px-lg">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-sm px-lg pb-xxl"
          renderItem={({ item }) => <FeedItemCard item={item} />}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState icon={Rss} title="No activity yet" description="Finalized games and new media will show up here." />
          }
        />
      )}
    </Screen>
  )
}
