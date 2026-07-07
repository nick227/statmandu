import { FlatList, View } from 'react-native'
import { Search } from 'lucide-react-native'
import { Input } from '@/shared/ui/Input'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Screen } from '@/shared/layout'
import { PlayerCardLink } from '@/modules/players/PlayerCardLink'
import { usePlayerSearch } from '@/modules/players/usePlayerSearch'

export function PlayerExploreScreen() {
  const { isLoading, players, q, setQ } = usePlayerSearch()

  return (
    <Screen title="Explore">
      <Input
        value={q}
        onChangeText={setQ}
        placeholder="Search players..."
        className="mx-lg mb-md"
      />
      {isLoading ? (
        <View className="flex-row gap-md px-lg">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-24 rounded-full" />)}
        </View>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(p) => p.id}
          numColumns={3}
          contentContainerClassName="gap-md px-lg pb-xxl"
          columnWrapperClassName="gap-md"
          renderItem={({ item }) => <PlayerCardLink player={item} />}
          ListEmptyComponent={
            <EmptyState icon={Search} title="No players found" description="Try a different search." />
          }
        />
      )}
    </Screen>
  )
}
