import { ActivityIndicator, FlatList, useWindowDimensions, View } from 'react-native'
import { User } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageFrame, Screen } from '@/shared/layout'
import { LAYOUT } from '@/shared/layout/layoutConstants'
import { PlayerCardLink } from '@/modules/players/PlayerCardLink'
import { useAthletesIndex } from '@/modules/players/useAthletesIndex'

function columnCount(width: number) {
  if (width >= LAYOUT.wideBreakpoint) return 3
  if (width >= 640) return 2
  return 1
}

export function AthletesIndexScreen() {
  const { width } = useWindowDimensions()
  const columns = columnCount(width)
  const { athletes, isError, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useAthletesIndex()

  return (
    <Screen title="Athletes" insetTop={false}>
      {isError ? (
        <View className="px-lg">
          <ErrorState message="Athletes couldn't be loaded." />
        </View>
      ) : isLoading ? (
        <View className="gap-md px-md">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-md" />
          ))}
        </View>
      ) : (
        <PageFrame
          main={
            <FlatList
              key={`athletes-${columns}`}
              data={athletes}
              keyExtractor={(player) => player.id}
              numColumns={columns}
              contentContainerClassName="gap-md pb-xxl"
              columnWrapperClassName={columns > 1 ? 'gap-md' : undefined}
              ListHeaderComponent={
                <View className="mb-sm gap-xs">
                  <Text variant="caption">
                    Browse public athlete profiles — jersey, position, team, and verification at a glance.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View className={columns > 1 ? 'flex-1' : 'w-full'}>
                  <PlayerCardLink player={item} />
                </View>
              )}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage()
              }}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-md" /> : null}
              ListEmptyComponent={
                <EmptyState
                  icon={User}
                  title="No athletes yet"
                  description="Seeded and claimed profiles will show up here."
                />
              }
            />
          }
          narrowSidebar="hidden"
        />
      )}
    </Screen>
  )
}
