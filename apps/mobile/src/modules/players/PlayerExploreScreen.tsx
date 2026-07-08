import { ActivityIndicator, FlatList, View } from 'react-native'
import { Search } from 'lucide-react-native'
import { Input } from '@/shared/ui/Input'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { ContentSection } from '@/shared/layout/ContentSection'
import { Screen } from '@/shared/layout'
import { useSportTheme } from '@/lib/theme'
import { SearchResultLink } from '@/modules/search/SearchResultLink'
import { useUnifiedSearch } from '@/modules/search/useUnifiedSearch'
import { EXPLORE_COPY } from '@/modules/leaderboards/exploreContent'
import { ExploreRankingsPanel } from '@/modules/leaderboards/ExploreRankingsPanel'
import { SearchResultsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { useExploreRankings } from '@/modules/leaderboards/useExploreRankings'

export function PlayerExploreScreen() {
  const copy = EXPLORE_COPY
  const search = useUnifiedSearch()
  const rankings = useExploreRankings()
  const sportTheme = useSportTheme(rankings.sportSlug)

  return (
    <Screen title={copy.screenTitle} style={sportTheme}>
      <FlatList
        data={search.isSearching ? search.results : []}
        keyExtractor={(r) => `${r.type}:${r.id}`}
        contentContainerClassName="gap-sm pb-xxl"
        renderItem={({ item }) => <SearchResultLink result={item} />}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (search.hasNextPage && !search.isFetchingNextPage) search.fetchNextPage()
        }}
        ListHeaderComponent={
          <View className="gap-md px-lg">
            <Input
              value={search.q}
              onChangeText={search.setQ}
              placeholder={copy.search.placeholder}
              className="mb-sm"
            />
            <ExploreRankingsPanel rankings={rankings} />
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
        }
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
    </Screen>
  )
}
