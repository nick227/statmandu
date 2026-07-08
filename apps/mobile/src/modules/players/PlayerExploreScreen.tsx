import { ActivityIndicator, FlatList, View } from 'react-native'
import { Search } from 'lucide-react-native'
import { Input } from '@/shared/ui/Input'
import { Text } from '@/shared/ui/Text'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { ContentSection } from '@/shared/layout/ContentSection'
import { PageFrame, Screen } from '@/shared/layout'
import { useSportTheme } from '@/lib/theme'
import { SearchResultLink } from '@/modules/search/SearchResultLink'
import { useUnifiedSearch } from '@/modules/search/useUnifiedSearch'
import { ConnectedCardsExploreSection } from '@/modules/cards/ConnectedCardsExploreSection'
import { EXPLORE_COPY } from '@/modules/leaderboards/exploreContent'
import { ExploreSidebar } from '@/modules/leaderboards/ExploreSidebar'
import { ExploreRankingsPanel } from '@/modules/leaderboards/ExploreRankingsPanel'
import { SearchResultsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { useExploreRankings } from '@/modules/leaderboards/useExploreRankings'

export function PlayerExploreScreen() {
  const copy = EXPLORE_COPY
  const search = useUnifiedSearch()
  const rankings = useExploreRankings()
  const sportTheme = useSportTheme(rankings.sportSlug)
  const header = (
    <View className="gap-md">
      <Input
        value={search.q}
        onChangeText={search.setQ}
        placeholder={copy.search.placeholder}
      />
      <ExploreRankingsPanel rankings={rankings} />
      {!search.isSearching ? <ConnectedCardsExploreSection /> : null}
      {search.isSearching ? (
        <ContentSection
          title={copy.sections.searchResults.title}
          subtitle={copy.sections.searchResults.subtitle}
        />
      ) : null}
      {search.isSearching && search.isError ? (
        <ErrorState message={copy.errors.search} />
      ) : null}
      {search.isSearching && search.isLoading ? <SearchResultsSkeleton /> : null}
    </View>
  )
  const main = (
    <FlatList
      data={search.isSearching ? search.results : []}
      keyExtractor={(r) => `${r.type}:${r.id}`}
      contentContainerClassName="gap-sm pb-xxl"
      renderItem={({ item }) => <SearchResultLink result={item} />}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (search.hasNextPage && !search.isFetchingNextPage) search.fetchNextPage()
      }}
      ListHeaderComponent={header}
      ListFooterComponent={
        search.isFetchingNextPage ? <ActivityIndicator className="py-md" /> : null
      }
      ListEmptyComponent={
        search.isSearching && !search.isLoading && !search.isError ? (
          <EmptyState
            icon={Search}
            title={copy.empty.search.title}
            description={copy.empty.search.description}
          />
        ) : null
      }
    />
  )

  return (
    <Screen title="Leaderboard" style={sportTheme} insetTop={false}>
      <PageFrame
        main={
          <View className="gap-sm">
            <Text variant="caption" className="px-0">
              Season leaders from finalized games — search anytime to jump to a player, team, or game.
            </Text>
            {main}
          </View>
        }
        sidebar={<ExploreSidebar rankings={rankings} />}
        narrowSidebar="hidden"
      />
    </Screen>
  )
}
