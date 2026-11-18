import { useCallback, useMemo, type ReactNode } from 'react'
import { FlatList, View, useWindowDimensions } from 'react-native'
import { CreditCard } from 'lucide-react-native'
import { PageFrame, Screen, GlobalFilterBar, ContentSection } from '@/shared/layout'
import { LAYOUT } from '@/shared/layout/layoutConstants'
import { EntityProfileTabs } from '@/shared/layout/entity-profile/EntityProfileTabs'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Text } from '@/shared/ui/Text'
import { ConnectedStatmanCard } from '@/modules/cards/ConnectedStatmanCard'
import { CardRail } from '@/modules/cards/CardRail'
import { CardsSidebar, partitionOwnedCards } from '@/modules/cards/CardsSidebar'
import { CARDS_BROWSE_TABS, useCardsBrowse, type CardsBrowseTab } from '@/modules/cards/useCardsBrowse'
import { useCardManager } from '@/modules/cards/useCardManager'
import { useAuthGate } from '@/modules/auth/useAuthGate'

function browseColumns(width: number) {
  if (width >= LAYOUT.pageMaxWidth) return 2
  return 1
}

const TAB_DESCRIPTION: Record<CardsBrowseTab, string> = {
  featured: 'Limited-edition drops getting the most traction right now.',
  new: 'Browse published Statman Cards — claim a drop, then create your own from the sidebar.',
  popular: 'Ranked by total downloads across every published card.',
  collections: 'Cards you\'ve claimed and saved.',
}

export function CardManagerScreen() {
  const { width } = useWindowDimensions()
  const columns = browseColumns(width)
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const browse = useCardsBrowse(isAuthenticated)
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

  // Memoized with a stable dependency array (browse.tab is a primitive,
  // browse.setTab is a useState setter — stable by React's own guarantee)
  // so this element's reference only changes when the active tab actually
  // does. Necessary, not just tidy: CardsGrid below memoizes FlatList's
  // ListHeaderComponent keyed partly off this value, and an unstable
  // tabBar reference would invalidate that memo every render.
  const tabBar = useMemo(() => <CardsTabBar tab={browse.tab} setTab={browse.setTab} />, [browse.tab, browse.setTab])

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

  if (browse.tab === 'collections') {
    return (
      <Screen title="Trading Cards" insetTop={false} scroll>
        <PageFrame
          main={
            <View className="gap-lg">
              <GlobalFilterBar />
              {tabBar}
              {!isAuthenticated ? (
                <SignInPrompt message="Sign in to see your collection" className="items-start py-lg" />
              ) : (
                <>
                  <ContentSection title="Claimed" subtitle="Copies you've claimed from published drops.">
                    {browse.claimedCards.length > 0 ? (
                      <CardRail cards={browse.claimedCards} source="EXPLORE" className="gap-sm" />
                    ) : (
                      <EmptyState icon={CreditCard} title="No claims yet" description="Claim a public card to see it here." />
                    )}
                  </ContentSection>
                  <ContentSection title="Saved" subtitle="Cards you've bookmarked to come back to.">
                    {browse.savedCards.length > 0 ? (
                      <CardRail cards={browse.savedCards} source="EXPLORE" className="gap-sm" />
                    ) : (
                      <EmptyState icon={CreditCard} title="Nothing saved yet" description="Tap Save on any card to add it here." />
                    )}
                  </ContentSection>
                </>
              )}
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
          <CardsGrid
            columns={columns}
            gridCards={gridCards}
            tab={browse.tab}
            featured={browse.featured}
            tabBar={tabBar}
            isAuthenticated={isAuthenticated}
            isAuthLoading={isAuthLoading}
          />
        }
        sidebar={sidebar}
        narrowSidebar="below"
      />
    </Screen>
  )
}

// The featured card's ConnectedStatmanCard here gets an explicit
// `authState` (this screen already subscribes to it via useAuthGate at
// the top) instead of letting it fall back to ConnectedCardClaimButton's
// own internal useCurrentUser() call. That fallback is what caused a real,
// confirmed infinite loop: a second independent useCurrentUser() subscriber
// mounted inside this FlatList's ListHeaderComponent sent react-query into
// a runaway refetch cycle specific to this FlatList context (live-observed
// at 200+ /auth/me requests/sec, page never rendering for an anonymous
// visitor) — memoizing ListHeaderComponent/renderItem alone did not fix it;
// only removing the second subscription did. ListHeaderComponent/renderItem
// are still memoized below since FlatList remeasures on identity changes
// regardless — real, just not sufficient on its own for this bug.
function CardsGrid({
  columns,
  gridCards,
  tab,
  featured,
  tabBar,
  isAuthenticated,
  isAuthLoading,
}: {
  columns: number
  gridCards: ReturnType<typeof useCardsBrowse>['cards']
  tab: CardsBrowseTab
  featured: ReturnType<typeof useCardsBrowse>['featured']
  tabBar: ReactNode
  isAuthenticated: boolean
  isAuthLoading: boolean
}) {
  const listHeader = useMemo(
    () => (
      <View className="mb-md gap-md">
        <GlobalFilterBar />
        {tabBar}
        <Text variant="caption">{TAB_DESCRIPTION[tab]}</Text>
        {featured ? (
          <View className="gap-sm">
            <ConnectedStatmanCard
              card={featured}
              size="featured"
              source="EXPLORE"
              authState={{ isAuthenticated, isAuthLoading }}
            />
            {gridCards.length > 0 ? <Text className="pt-sm text-lg font-semibold">More cards</Text> : null}
          </View>
        ) : null}
      </View>
    ),
    [tabBar, tab, featured, gridCards.length, isAuthenticated, isAuthLoading]
  )

  const listEmpty = useMemo(
    () =>
      featured ? null : (
        <EmptyState
          icon={CreditCard}
          title="No cards yet"
          description="When creators publish drops, they'll show up here to browse and claim."
        />
      ),
    [featured]
  )

  const keyExtractor = useCallback((card: (typeof gridCards)[number]) => card.id, [])
  const renderItem = useCallback(
    ({ item }: { item: (typeof gridCards)[number] }) => (
      <View className={columns > 1 ? 'flex-1' : 'w-full'}>
        <ConnectedStatmanCard
          card={item}
          size="rail"
          source="EXPLORE"
          className="w-full"
          authState={{ isAuthenticated, isAuthLoading }}
        />
      </View>
    ),
    [columns, isAuthenticated, isAuthLoading]
  )

  return (
    <FlatList
      key={`cards-${tab}-${columns}`}
      data={gridCards}
      keyExtractor={keyExtractor}
      numColumns={columns}
      contentContainerClassName="gap-md pb-xxl"
      columnWrapperClassName={columns > 1 ? 'gap-12' : undefined}
      ListHeaderComponent={listHeader}
      renderItem={renderItem}
      ListEmptyComponent={listEmpty}
    />
  )
}

function CardsTabBar({ tab, setTab }: { tab: CardsBrowseTab; setTab: (tab: CardsBrowseTab) => void }) {
  return (
    <EntityProfileTabs
      tabs={CARDS_BROWSE_TABS.map((t) => t.label)}
      active={CARDS_BROWSE_TABS.find((t) => t.key === tab)!.label}
      onChange={(label) => setTab(CARDS_BROWSE_TABS.find((t) => t.label === label)!.key)}
      className="px-0 mb-md"
    />
  )
}
