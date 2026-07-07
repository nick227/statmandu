import { FlatList, View } from 'react-native'
import { Rss } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Screen } from '@/shared/layout'
import { FeedItemCard } from '@/modules/feed/FeedItemCard'
import { useHomeFeed } from '@/modules/feed/useHomeFeed'

export function HomeFeedScreen() {
  const { fetchNextPage, hasNextPage, isLoading, items } = useHomeFeed()

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
