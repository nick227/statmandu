import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { Search } from 'lucide-react-native'
import { usePlayers } from '@statman/sdk'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/layout'
import { PlayerCard } from '@/components/domain'

// Explore — surface 2. Search/filter is primary per docs; rankings and
// leaderboards need a backend ranking endpoint that doesn't exist yet
// (see CLAUDE.md parking lot) — search covers the MVP demo scope for now.
export default function ExploreScreen() {
  const [q, setQ] = useState('')
  const { data, isLoading } = usePlayers(q ? { q } : undefined)
  const players = data?.pages.flatMap((p) => p.data) ?? []

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
          renderItem={({ item }) => <PlayerCard player={item} />}
          ListEmptyComponent={
            <EmptyState icon={Search} title="No players found" description="Try a different search." />
          }
        />
      )}
    </Screen>
  )
}
