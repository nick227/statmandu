import { FlatList, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Shield } from 'lucide-react-native'
import { useTeams } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TeamCard } from '@/components/domain'

// Teams — surface for team management and roster support. MVP has no
// "my teams" backend concept yet (no team-manager relation on User) — this
// lists all teams, fine at demo scale (2 teams). See CLAUDE.md parking lot.
export default function TeamsScreen() {
  const insets = useSafeAreaInsets()
  const { data, isLoading } = useTeams()

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <Text variant="entityName" className="px-lg pt-md pb-sm">Teams</Text>
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
    </View>
  )
}
