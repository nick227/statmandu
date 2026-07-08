import { ScrollView, View, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Radio, ClipboardList, Eye, MonitorPlay } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { SignInPrompt } from '@/shared/ui/SignInPrompt'
import { Screen, PageFrame, GlobalFilterBar } from '@/shared/layout'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { useAuthGate } from '@/modules/auth/useAuthGate'
import { useLiveScoringGames } from '@/modules/live-scoring/useLiveScoringGames'
import { EnterSidebar } from '@/modules/live-scoring/EnterSidebar'
import { useNativeColor } from '@/lib/theme'

type Game = components['schemas']['Game']

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function JobRow({
  label,
  icon: Icon,
  onPress,
}: {
  label: string
  icon: typeof ClipboardList
  onPress: () => void
}) {
  const brandColor = useNativeColor('brand')
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[44px] flex-row items-center gap-sm rounded-sm border border-border bg-surface px-sm py-sm active:opacity-70"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/10">
        <Icon size={16} color={brandColor} />
      </View>
      <Text className="flex-1 font-semibold">{label}</Text>
    </Pressable>
  )
}

function GameCard({ item }: { item: Game }) {
  const homeTeam = item.gameTeams.find((gt) => gt.isHome)?.team
  const awayTeam = item.gameTeams.find((gt) => !gt.isHome)?.team
  const router = useRouter()
  const canEnter = item.status !== 'FINAL' && item.status !== 'DISPUTED'

  return (
    <View className="overflow-hidden rounded-md border border-border bg-surface">
      <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: item.id } }} asChild>
        <Pressable className="gap-xs p-md active:opacity-70">
          <View className="flex-row items-start justify-between gap-sm">
            <View className="min-w-0 flex-1 gap-xs">
              <Text className="font-semibold" numberOfLines={2}>
                {awayTeam?.name ?? 'Away'} @ {homeTeam?.name ?? 'Home'}
              </Text>
              <Text variant="caption">{formatKickoff(item.scheduledAt)}</Text>
            </View>
            <GameStatusBadge status={item.status} />
          </View>
        </Pressable>
      </Link>

      {canEnter ? (
        <View className="gap-sm border-t border-border bg-canvas/40 p-sm">
          <JobRow
            label="Score the Game"
            icon={ClipboardList}
            onPress={() => router.push({ pathname: '/games/[gameId]/live', params: { gameId: item.id, intent: 'TEAM_SCORER' } })}
          />
          <JobRow
            label="Broadcast"
            icon={MonitorPlay}
            onPress={() => router.push({ pathname: '/games/[gameId]/live', params: { gameId: item.id, intent: 'BROADCASTER' } })}
          />
          <JobRow
            label="Watch"
            icon={Eye}
            onPress={() => router.push({ pathname: '/games/[gameId]/spectate', params: { gameId: item.id } })}
          />
        </View>
      ) : null}
    </View>
  )
}

function GameSection({ title, games }: { title: string; games: Game[] }) {
  if (games.length === 0) return null
  return (
    <View className="gap-sm">
      <Text className="text-base font-bold text-text">{title}</Text>
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
      <Screen title="Games" insetTop={false} contentClassName="px-md">
        <View className="flex-1 items-center justify-center py-xxl">
          <View className="w-full max-w-[420px] gap-md rounded-md border border-border bg-surface p-lg">
            <Text className="text-center text-lg font-bold">Ready for game time?</Text>
            <Text variant="caption" className="text-center">
              Sign in to open live games, start scoring, or cast a broadcast display.
            </Text>
            <SignInPrompt message="Sign in to continue" className="items-center py-sm" />
          </View>
        </View>
      </Screen>
    )
  }

  const liveGames = games.filter((g) => g.status === 'LIVE')
  const scheduledGames = games.filter((g) => g.status === 'SCHEDULED')
  const finalGames = games.filter((g) => g.status === 'FINAL' || g.status === 'DISPUTED')

  return (
    <Screen title="Games" insetTop={false}>
      <PageFrame
        main={
          isError ? (
            <ErrorState message="Games couldn't be loaded." />
          ) : isLoading ? (
            <View className="gap-sm">
              {[0, 1].map((i) => <Skeleton key={i} className="h-28 w-full rounded-md" />)}
            </View>
          ) : games.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No games available"
              description="There are no scheduled, live, or recent games."
            />
          ) : (
            <ScrollView contentContainerClassName="gap-lg pb-xxl" showsVerticalScrollIndicator={false}>
              <GlobalFilterBar />
              <Text variant="caption">
                Pick a game, then score, broadcast, or watch from the sidelines.
              </Text>
              <GameSection title="Live now" games={liveGames} />
              <GameSection title="Upcoming" games={scheduledGames} />
              <GameSection title="Recent" games={finalGames} />
            </ScrollView>
          )
        }
        sidebar={!isLoading && !isError ? <EnterSidebar games={games} /> : undefined}
        narrowSidebar="hidden"
      />
    </Screen>
  )
}
