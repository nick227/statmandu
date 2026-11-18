import { View } from 'react-native'
import { Stack, Link } from 'expo-router'
import { Screen } from '@/shared/layout'
import { Text } from '@/shared/ui/Text'
import { Card, CardContent } from '@/shared/ui/Card'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { ConnectedActAsBar } from '@/modules/admin/ConnectedActAsBar'
import { useAdminGames } from '@/modules/admin/useAdminGames'

export function AdminGamesScreen() {
  const { isAdmin, isAuthLoading } = useAuthGate()
  const { games } = useAdminGames()

  if (!isAuthLoading && !isAdmin) {
    return (
      <Screen title="Games">
        <Stack.Screen options={{ headerShown: true, title: 'Admin · Games' }} />
        <ErrorState message="Admin access required." />
      </Screen>
    )
  }

  return (
    <Screen scroll contentClassName="gap-md p-lg">
      <Stack.Screen options={{ headerShown: true, title: 'Admin · Games' }} />
      <ConnectedActAsBar />

      {games.isError ? <ErrorState message="Games couldn't be loaded." /> : null}
      {games.isLoading ? <LoadingState /> : null}
      {!games.isLoading && !games.isError ? (
        <View className="gap-sm">
          {(games.data?.data ?? []).map((g: any) => (
            <Card key={g.id}>
              <CardContent className="gap-xs">
                <Text className="font-semibold">Game {g.id}</Text>
                <Text variant="caption">{g.status} · {new Date(g.scheduledAt).toLocaleString()}</Text>
                <View className="flex-row gap-sm">
                  <Link href={{ pathname: '/games/[gameId]', params: { gameId: g.id } }} asChild>
                    <Text variant="caption" className="underline">Detail</Text>
                  </Link>
                  {g.status === 'SCHEDULED' || g.status === 'LIVE' ? (
                    <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: g.id, intent: 'TEAM_SCORER' } }} asChild>
                      <Text variant="caption" className="underline">Score</Text>
                    </Link>
                  ) : (
                    <Link href={{ pathname: '/games/[gameId]/score', params: { gameId: g.id } }} asChild>
                      <Text variant="caption" className="underline">Add score</Text>
                    </Link>
                  )}
                  <Link href={{ pathname: '/games/[gameId]/spectate', params: { gameId: g.id } }} asChild>
                    <Text variant="caption" className="underline">Spectate</Text>
                  </Link>
                  {g.status === 'SCHEDULED' || g.status === 'LIVE' ? (
                    <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: g.id, intent: 'BROADCASTER' } }} asChild>
                      <Text variant="caption" className="underline">Broadcast</Text>
                    </Link>
                  ) : null}
                </View>
              </CardContent>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  )
}
