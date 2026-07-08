import { FlatList, View } from 'react-native'
import { Shield } from 'lucide-react-native'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageFrame, Screen } from '@/shared/layout'
import { TeamCardLink } from '@/modules/teams/TeamCardLink'
import { useTeamsIndex } from '@/modules/teams/useTeamsIndex'
import { TeamsSidebar } from '@/modules/teams/TeamsSidebar'

export function TeamsIndexScreen() {
  const { isError, isLoading, teams } = useTeamsIndex()

  return (
    <Screen title="Teams" withBack>
      {isError ? (
        <ErrorState message="Teams couldn't be loaded." />
      ) : isLoading ? (
        <View className="flex-row gap-md px-lg">
          {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-24 rounded-full" />)}
        </View>
      ) : (
        <PageFrame
          main={
            <FlatList
              data={teams}
              keyExtractor={(t) => t.id}
              numColumns={2}
              contentContainerClassName="gap-md pb-xxl"
              columnWrapperClassName="gap-md"
              renderItem={({ item }) => <TeamCardLink team={item} className="flex-1" />}
              ListEmptyComponent={<EmptyState icon={Shield} title="No teams yet" />}
            />
          }
          sidebar={<TeamsSidebar teams={teams} />}
          narrowSidebar="below"
        />
      )}
    </Screen>
  )
}
