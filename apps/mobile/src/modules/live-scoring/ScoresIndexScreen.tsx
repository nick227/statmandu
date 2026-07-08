import { ScrollView, View, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Radio, ClipboardList, Target, Eye, MonitorPlay } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Screen } from '@/shared/layout'
import { PageFrame } from '@/shared/layout'
import { Button } from '@/shared/ui/Button'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useLiveScoringGames } from '@/modules/live-scoring/useLiveScoringGames'
import { EnterSidebar } from '@/modules/live-scoring/EnterSidebar'
import { useNativeColor } from '@/lib/theme'

function GameCard({ item }: { item: any }) {
  const homeTeam = item.gameTeams.find((gt: any) => gt.isHome)?.team
  const awayTeam = item.gameTeams.find((gt: any) => !gt.isHome)?.team
  const router = useRouter()
  const brandColor = useNativeColor('brand')
  
  return (
    <View className="rounded-md border border-border bg-surface overflow-hidden">
      <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: item.id } }} asChild>
        <Pressable className="flex-row items-center justify-between p-md active:opacity-70">
          <View>
            <Text className="font-semibold">
              {homeTeam?.name} vs {awayTeam?.name}
            </Text>
            <Text variant="caption">{new Date(item.scheduledAt).toLocaleString()}</Text>
          </View>
          <GameStatusBadge status={item.status} />
        </Pressable>
      </Link>
      
      {item.status !== 'FINAL' && (
        <View className="flex-col border-t border-border p-sm gap-sm bg-canvas/30">
          <Pressable 
            onPress={() => router.push({ pathname: '/games/[gameId]/live', params: { gameId: item.id, intent: 'TEAM_SCORER' } })}
            className="flex-row items-center gap-md rounded-md border border-border bg-surface p-sm active:opacity-70"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-brand/10">
              <ClipboardList size={16} color={brandColor} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm">Score the Game</Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => router.push({ pathname: '/games/[gameId]/live', params: { gameId: item.id, intent: 'BROADCASTER' } })}
            className="flex-row items-center gap-md rounded-md border border-border bg-surface p-sm active:opacity-70"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-brand/10">
              <MonitorPlay size={16} color={brandColor} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm">Broadcast</Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => router.push({ pathname: '/games/[gameId]/spectate', params: { gameId: item.id } })}
            className="flex-row items-center gap-md rounded-md border border-border bg-surface p-sm active:opacity-70"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-brand/10">
              <Eye size={16} color={brandColor} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm">Watch</Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  )
}

function GameSection({ title, games }: { title: string; games: any[] }) {
  if (games.length === 0) return null
  return (
    <View className="gap-sm">
      <Text className="text-lg font-bold">{title}</Text>
      <View className="gap-sm">
        {games.map((game) => (
          <GameCard key={game.id} item={game} />
        ))}
      </View>
    </View>
  )
}

export function ScoresIndexScreen() {
  const { isAuthenticated, isAuthLoading } = useAuthGate()
  const { games, isError, isLoading } = useLiveScoringGames()

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <Screen title="Scores" insetTop={false}>
        <SignInPrompt message="Sign in to view and enter scores." />
      </Screen>
    )
  }

  const liveGames = games.filter((g) => g.status === 'LIVE')
  const scheduledGames = games.filter((g) => g.status === 'SCHEDULED')
  const finalGames = games.filter((g) => g.status === 'FINAL' || g.status === 'DISPUTED')

  return (
    <Screen title="Scores" insetTop={false}>
      <PageFrame
        main={
          isError ? (
            <ErrorState message="Games couldn't be loaded." />
          ) : isLoading ? (
            <View className="gap-sm">
              {[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </View>
          ) : games.length === 0 ? (
            <EmptyState icon={Radio} title="No games available" description="There are no scheduled, live, or recent games." />
          ) : (
            <ScrollView contentContainerClassName="gap-lg pb-xxl" showsVerticalScrollIndicator={false}>
              <GameSection title="Current Games" games={liveGames} />
              <GameSection title="Upcoming Games" games={scheduledGames} />
              <GameSection title="Recent Scores" games={finalGames} />
            </ScrollView>
          )
        }
        sidebar={!isLoading && !isError ? <EnterSidebar games={games} /> : undefined}
      />
    </Screen>
  )
}
