import { FlatList, Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Radio } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Screen } from '@/shared/layout'
import { PageFrame } from '@/shared/layout'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useLiveScoringGames } from '@/modules/live-scoring/useLiveScoringGames'
import { EnterSidebar } from '@/modules/live-scoring/EnterSidebar'

export function LiveScoringIndexScreen() {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const { games, isError, isLoading } = useLiveScoringGames()

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Screen title="Enter">
        <SignInPrompt message="Sign in to enter stats for a game." />
      </Screen>
    )
  }

  return (
    <Screen title="Enter">
      <PageFrame
        main={
          isError ? (
            <ErrorState message="Games couldn't be loaded." />
          ) : isLoading ? (
            <View className="gap-sm">
              {[0, 1].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </View>
          ) : (
            <FlatList
              data={games}
              keyExtractor={(g) => g.id}
              contentContainerClassName="gap-sm pb-xxl"
              renderItem={({ item }) => (
                <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: item.id } }} asChild>
                  <Pressable className="flex-row items-center justify-between rounded-md border border-border p-md active:opacity-70">
                    <View>
                      <Text className="font-semibold">
                        {item.gameTeams.find((gt) => gt.isHome)?.team?.name} vs {item.gameTeams.find((gt) => !gt.isHome)?.team?.name}
                      </Text>
                      <Text variant="caption">{new Date(item.scheduledAt).toLocaleString()}</Text>
                    </View>
                    <GameStatusBadge status={item.status} />
                  </Pressable>
                </Link>
              )}
              ListEmptyComponent={
                <EmptyState icon={Radio} title="No games to enter" description="Scheduled and live games you can score will show up here." />
              }
            />
          )
        }
        sidebar={!isLoading && !isError ? <EnterSidebar games={games} /> : undefined}
      />
    </Screen>
  )
}
