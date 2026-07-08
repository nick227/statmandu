import { FlatList, View } from 'react-native'
import { Search } from 'lucide-react-native'
import { Input } from '@/shared/ui/Input'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { ContentSection } from '@/shared/layout/ContentSection'
import { Screen } from '@/shared/layout'
import { useSportTheme } from '@/lib/theme'
import { PlayerCardLink } from '@/modules/players/PlayerCardLink'
import { usePlayerSearch } from '@/modules/players/usePlayerSearch'
import { EXPLORE_COPY } from '@/modules/leaderboards/exploreContent'
import { ExploreRankingsPanel } from '@/modules/leaderboards/ExploreRankingsPanel'
import { SearchResultsSkeleton } from '@/modules/leaderboards/RankingsSkeleton'
import { useExploreRankings } from '@/modules/leaderboards/useExploreRankings'

export function PlayerExploreScreen() {
  const copy = EXPLORE_COPY
  const search = usePlayerSearch()
  const rankings = useExploreRankings()
  const sportTheme = useSportTheme(rankings.sportSlug)
  const isSearching = search.q.length > 0

  return (
    <Screen title={copy.screenTitle} style={sportTheme}>
      <FlatList
        data={isSearching ? search.players : []}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerClassName="gap-md px-lg pb-xxl"
        columnWrapperClassName="gap-md"
        renderItem={({ item }) => <PlayerCardLink player={item} className="flex-1" />}
        ListHeaderComponent={
          <View className="gap-md">
            <Input
              value={search.q}
              onChangeText={search.setQ}
              placeholder={copy.search.placeholder}
              className="mb-sm"
            />
            <ExploreRankingsPanel rankings={rankings} />
            {isSearching ? (
              <ContentSection
                title={copy.sections.searchResults.title}
                subtitle={copy.sections.searchResults.subtitle}
              />
            ) : null}
            {isSearching && search.isError ? (
              <ErrorState message={copy.errors.search} />
            ) : null}
            {isSearching && search.isLoading ? <SearchResultsSkeleton /> : null}
          </View>
        }
        ListEmptyComponent={
          isSearching && !search.isLoading && !search.isError ? (
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
