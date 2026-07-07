import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import { useGame, useGameStats } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetScrollView } from '@/components/ui/Sheet'
import { EntityTabs } from '@/components/entity'
import { GameScoreboard, BoxScoreTable } from '@/components/domain'

const TABS = ['Box Score', 'Top Performers']

// Game Page — surface 5. Games are a two-team matchup, not a single
// identity, so this does NOT reuse EntityProfileShell (which assumes one
// hero + one identity) — it composes the same lower-level primitives
// (Sheet, EntityTabs) directly instead. See docs/frontend-architecture.md.
export default function GamePageScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  const [tab, setTab] = useState(TABS[0])

  const { data: gameRes, isLoading } = useGame(gameId)
  const { data: statsRes } = useGameStats(gameId)

  const topPerformers = useMemo(
    () => [...(statsRes?.data ?? [])].sort((a, b) => b.points - a.points).slice(0, 3),
    [statsRes]
  )

  if (isLoading || !gameRes) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Spinner />
      </View>
    )
  }

  const game = gameRes.data

  return (
    <View className="flex-1 bg-canvas">
      <GameScoreboard game={game} />

      <View className="flex-row gap-sm px-lg pb-sm">
        {game.status === 'SCHEDULED' || game.status === 'LIVE' ? (
          <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: game.id } }} asChild>
            <Button size="sm">Enter Stats</Button>
          </Link>
        ) : null}
        <Link href={{ pathname: '/games/[gameId]/spectate', params: { gameId: game.id } }} asChild>
          <Button variant="secondary" size="sm">Watch Live</Button>
        </Link>
      </View>

      <Sheet snaps={['half', 'expanded']}>
        <EntityTabs tabs={TABS} active={tab} onChange={setTab} />
        <SheetScrollView contentContainerClassName="pb-xxl">
          {tab === 'Box Score' ? (
            <BoxScoreTable
              lines={statsRes?.data ?? []}
              playerNameById={{}}
            />
          ) : (
            <View className="px-lg gap-sm pt-sm">
              {topPerformers.length === 0 ? (
                <Text variant="caption">No finalized stats yet.</Text>
              ) : (
                topPerformers.map((line) => (
                  <Text key={line.id}>{line.points} PTS · {line.assists} AST · {line.offRebounds + line.defRebounds} REB</Text>
                ))
              )}
            </View>
          )}
        </SheetScrollView>
      </Sheet>
    </View>
  )
}
