import { ScrollView, View, Pressable } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { Radio } from 'lucide-react-native'
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
import { ConnectedAddGamePanel } from '@/modules/live-scoring/ConnectedAddGamePanel'

type Game = components['schemas']['Game']

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function GameCard({ item, action }: { item: Game; action?: 'broadcast' | 'score' }) {
  const homeTeam = item.gameTeams.find((gt) => gt.isHome)?.team
  const awayTeam = item.gameTeams.find((gt) => !gt.isHome)?.team

  const href = action === 'broadcast'
    ? { pathname: '/games/[gameId]/live', params: { gameId: item.id, intent: 'BROADCASTER' } }
    : action === 'score'
      ? item.status === 'FINAL' || item.status === 'DISPUTED'
        ? { pathname: '/games/[gameId]/score', params: { gameId: item.id } }
        : { pathname: '/games/[gameId]/live', params: { gameId: item.id, intent: 'TEAM_SCORER' } }
      : { pathname: '/games/[gameId]', params: { gameId: item.id } }

  return (
    <View className="overflow-hidden rounded-md border border-border bg-surface">
      <Link href={href as never} asChild>
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
    </View>
  )
}

function GameSection({ title, games, action }: { title: string; games: Game[]; action?: 'broadcast' | 'score' }) {
  if (games.length === 0) return null
  return (
    <View className="gap-sm">
      <Text className="text-base font-bold text-text">{title}</Text>
      <View className="gap-sm">
        {games.map((game) => (
          <GameCard key={game.id} item={game} action={action} />
        ))}
      </View>
    </View>
  )
}

export function GamesIndexScreen() {
  const { action, create } = useLocalSearchParams<{ action?: 'broadcast' | 'score'; create?: string }>()
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
  const isBroadcastSelection = action === 'broadcast'

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
            <View className="gap-lg">
              {!action ? <ConnectedAddGamePanel defaultExpanded={create === '1'} /> : (
                <View className="rounded-md border border-brand/30 bg-brand/10 p-md">
                  <Text className="font-semibold">{isBroadcastSelection ? 'No games available to broadcast' : 'No games available to score'}</Text>
                  <Text variant="caption">Add a game first, then return to this action.</Text>
                </View>
              )}
              <EmptyState
                icon={Radio}
                title="No games available"
                description="Use Create → Game to add one."
              />
            </View>
          ) : (
            <ScrollView contentContainerClassName="gap-lg pb-xxl" showsVerticalScrollIndicator={false}>
              <GlobalFilterBar />
              {!action ? <ConnectedAddGamePanel defaultExpanded={create === '1'} /> : null}
              {action ? (
                <View className="rounded-md border border-brand/30 bg-brand/10 p-md">
                  <Text className="font-semibold">{isBroadcastSelection ? 'Choose a game to broadcast' : 'Choose a game to score'}</Text>
                  <Text variant="caption">
                    {isBroadcastSelection ? 'Only scheduled and live games can be broadcast.' : 'Historical games open final-score entry.'}
                  </Text>
                </View>
              ) : null}
              <Text variant="caption">
                Open a game for its score, coverage, scoring tools, and live broadcast controls.
              </Text>
              <GameSection title="Live now" games={liveGames} action={action} />
              <GameSection title="Upcoming" games={scheduledGames} action={action} />
              {!isBroadcastSelection ? <GameSection title="Recent" games={finalGames} action={action} /> : null}
              {isBroadcastSelection && liveGames.length + scheduledGames.length === 0 ? (
                <EmptyState icon={Radio} title="No broadcastable games" description="Only scheduled and live games can start a broadcast." />
              ) : null}
            </ScrollView>
          )
        }
        sidebar={!isLoading && !isError ? <EnterSidebar games={games} /> : undefined}
        narrowSidebar="hidden"
      />
    </Screen>
  )
}
