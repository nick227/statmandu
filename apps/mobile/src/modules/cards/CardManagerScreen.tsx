import { FlatList, View, useWindowDimensions } from 'react-native'
import { CreditCard } from 'lucide-react-native'
import { PageFrame, Screen, GlobalFilterBar } from '@/shared/layout'
import { LAYOUT } from '@/shared/layout/layoutConstants'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Text } from '@/shared/ui/Text'
import { ConnectedStatmanCard } from '@/modules/cards/ConnectedStatmanCard'
import { CardsSidebar, partitionOwnedCards } from '@/modules/cards/CardsSidebar'
import { useCardsBrowse } from '@/modules/cards/useCardsBrowse'
import { useCardManager } from '@/modules/cards/useCardManager'
import { useAuthGate } from '@/modules/auth/useAuthGate'

function browseColumns(width: number) {
  if (width >= LAYOUT.wideBreakpoint) return 3
  if (width >= 640) return 2
  return 1
}

export function CardManagerScreen() {
  const { width } = useWindowDimensions()
  const columns = browseColumns(width)
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const browse = useCardsBrowse()
  const manager = useCardManager(isAuthenticated && !isAuthLoading)
  const { inProgress } = partitionOwnedCards(manager.createdCards)

  const sidebar = (
    <CardsSidebar
      filter={browse.filter}
      onFilterChange={browse.setFilter}
      isAuthenticated={isAuthenticated}
      inProgress={inProgress}
      claimed={manager.claimedCards}
    />
  )

  if (browse.isError) {
    return (
      <Screen title="Trading Cards" insetTop={false}>
        <PageFrame
          main={<ErrorState message="Trading cards couldn't be loaded." />}
          sidebar={sidebar}
          narrowSidebar="below"
        />
      </Screen>
    )
  }

  if (browse.isLoading || isAuthLoading) {
    return (
      <Screen title="Trading Cards" insetTop={false}>
        <GlobalFilterBar />
        <PageFrame
          main={
            <View className="gap-md">
              <Skeleton className="h-80 w-full rounded-lg" />
              <View className="flex-row gap-md">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-56 flex-1 rounded-lg" />
                ))}
              </View>
            </View>
          }
          sidebar={sidebar}
          narrowSidebar="below"
        />
      </Screen>
    )
  }

  const gridCards = browse.featured ? browse.rest : browse.cards

  return (
    <Screen title="Trading Cards" insetTop={false}>
      <PageFrame
        main={
          <FlatList
            key={`cards-${columns}`}
            data={gridCards}
            keyExtractor={(card) => card.id}
            numColumns={columns}
            contentContainerClassName="gap-md pb-xxl"
            columnWrapperClassName={columns > 1 ? 'gap-md' : undefined}
            ListHeaderComponent={
              <View className="mb-md gap-md">
                <GlobalFilterBar />
                <Text variant="caption">
                  Browse published Statman Cards — claim a drop, then create your own from the sidebar.
                </Text>
                {browse.featured ? (
                  <View className="gap-sm">
                    <Text className="text-lg font-semibold">New drops</Text>
                    <Text variant="caption">Latest public releases, ready to claim.</Text>
                    <ConnectedStatmanCard card={browse.featured} size="featured" />
                    {gridCards.length > 0 ? (
                      <Text className="pt-sm text-lg font-semibold">More cards</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            }
            renderItem={({ item }) => (
              <View className={columns > 1 ? 'flex-1' : 'w-full'}>
                <ConnectedStatmanCard card={item} size="rail" className="w-full" />
              </View>
            )}
            ListEmptyComponent={
              browse.featured ? null : (
                <EmptyState
                  icon={CreditCard}
                  title="No cards yet"
                  description="When creators publish drops, they'll show up here to browse and claim."
                />
              )
            }
          />
        }
        sidebar={sidebar}
        narrowSidebar="below"
      />
    </Screen>
  )
}
