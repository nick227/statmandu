import { ActivityIndicator, FlatList, View } from 'react-native'
import { User } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageFrame, Screen } from '@/shared/layout'
import { PlayerCardLink } from '@/modules/players/PlayerCardLink'
import { useAthletesIndex } from '@/modules/players/useAthletesIndex'

export function AthletesIndexScreen() {
  const { athletes, isError, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useAthletesIndex()

  return (
    <Screen title="Athletes" insetTop={false}>
      {isError ? (
        <ErrorState message="Athletes couldn't be loaded." />
      ) : isLoading ? (
        <View className="flex-row flex-wrap gap-md px-lg">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-[47%] rounded-md" />)}
        </View>
      ) : (
        <PageFrame
          main={
            <FlatList
              data={athletes}
              keyExtractor={(player) => player.id}
              numColumns={2}
              contentContainerClassName="gap-md pb-xxl"
              columnWrapperClassName="gap-md"
              renderItem={({ item }) => <PlayerCardLink player={item} className="flex-1" />}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
              }}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-md" /> : null}
              ListEmptyComponent={<EmptyState icon={User} title="No athletes yet" />}
            />
          }
          narrowSidebar="hidden"
        />
      )}
    </Screen>
  )
}
