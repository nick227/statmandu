import { FlatList, View } from 'react-native'
import { Shield } from 'lucide-react-native'
import { useTeams } from '@statman/sdk'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/layout'
import { TeamCard } from '@/components/domain'

// Teams — surface for team management and roster support. MVP has no
// "my teams" backend concept yet (no team-manager relation on User) — this
// lists all teams, fine at demo scale (2 teams). See CLAUDE.md parking lot.
export default function TeamsScreen() {
  const { data, isLoading } = useTeams()

  return (
    <Screen title="Teams">
      {isLoading ? (
        <View className="flex-row gap-md px-lg">
          {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-24 rounded-full" />)}
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(t) => t.id}
          numColumns={3}
          contentContainerClassName="gap-md px-lg pb-xxl"
          columnWrapperClassName="gap-md"
          renderItem={({ item }) => <TeamCard team={item} />}
          ListEmptyComponent={<EmptyState icon={Shield} title="No teams yet" />}
        />
      )}
    </Screen>
  )
}
