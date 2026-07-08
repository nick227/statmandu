import { Pressable, View, useWindowDimensions } from 'react-native'
import { Link, Stack } from 'expo-router'
import { BarChart3, Radio } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { Sheet, SheetScrollView } from '@/shared/ui/Sheet'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { EntityProfileTabs } from '@/shared/layout/entity-profile/EntityProfileTabs'
import { GlassPanel, LAYOUT, MediaChrome, MediaSurface, TabPanel, WideSidebarColumn } from '@/shared/layout'
import { StatChip } from '@/shared/ui/StatChip'
import { useSportTheme } from '@/lib/theme'
import { useGameDetail } from '@/modules/games/useGameDetail'
import { ConnectedGameActionRail } from '@/modules/games/ConnectedGameActionRail'
import { GamePlayByPlay } from '@/modules/games/GamePlayByPlay'
import { MediaGrid } from '@/modules/media/MediaGrid'
import { useTargetMediaViewer } from '@/modules/media/useTargetMediaViewer'
import { YouTubeMediaAttachForm } from '@/modules/media/YouTubeMediaAttachForm'
import { ConnectedSourcesPanel } from '@/modules/disputes/ConnectedSourcesPanel'
import { getSportDefinition } from '@statman/sports'
import { SportStatTable, formattedSportStat, sportStatLabel } from '@/modules/sports'
import { GameStatusBadge } from './GameStatusBadge'
import { GameSidebar } from './GameSidebar'

const GAME_DETAIL_LAYOUT = {
  scorePanelBottom: '42%',
  actionBottom: '34%',
} as const

export function GameDetailScreen({ gameId }: { gameId: string }) {
  const gameState = useGameDetail(gameId)
  const sportTheme = useSportTheme(gameState.game?.sport?.slug)
  const mediaViewer = useTargetMediaViewer(gameState.media, 'GAME', gameId)
  const { width } = useWindowDimensions()
  const showSidebar = width >= LAYOUT.wideBreakpoint

  if (gameState.isError) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Game' }} />
        <ErrorState message="This game couldn't be loaded." />
      </>
    )
  }

  if (gameState.isLoading || !gameState.game) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, title: 'Game' }} />
        <LoadingState />
      </>
    )
  }

  const { events, game, media, playerNameById, setTab, stats, tab, tabs, teamNameById, topPerformers } = gameState
  const home = game.gameTeams.find((gt) => gt.isHome)
  const away = game.gameTeams.find((gt) => !gt.isHome)
  const homeName = home?.team?.name ?? 'Home'
  const awayName = away?.team?.name ?? 'Away'
  const sport = game.sport?.slug ?? 'basketball'
  const leaderboardStats = getSportDefinition(sport).views.leaderboard.slice(0, 3)
  const { mediaItems } = mediaViewer
  const primaryMedia = mediaItems[0]
  const heroVideoId = primaryMedia?.youtubeVideoId ?? null
  const scoreFor = (score?: number | null) => score ?? 0
  const scheduled = new Date(game.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const gameTitle = `${homeName} vs ${awayName}`
  const performerMeta = (line: (typeof topPerformers)[number]) =>
    leaderboardStats.map((key) => `${formattedSportStat(sport, line, key)} ${sportStatLabel(sport, key)}`).join(' · ')

  const main = (
    <MediaSurface
      youtubeVideoId={heroVideoId}
      onVideoPress={heroVideoId ? () => mediaViewer.setViewerIndex(0) : undefined}
      style={sportTheme}
    >
      <Stack.Screen options={{ headerShown: false, title: gameTitle }} />
      <MediaChrome title={game.sport?.name ?? 'Game'} />

      <View className="absolute inset-x-0 z-10 px-lg" style={{ bottom: GAME_DETAIL_LAYOUT.scorePanelBottom }}>
        <GlassPanel className="gap-md p-lg">
          <View className="flex-row items-center justify-between">
            <GameStatusBadge status={game.status} />
            <Text variant="caption" className="text-white/70">{scheduled}</Text>
          </View>
          <View className="flex-row items-end justify-between gap-md">
            <View className="flex-1 gap-sm">
              <Text className="text-white/70" numberOfLines={1}>{homeName}</Text>
              <Text variant="statValue" className="text-white">{scoreFor(home?.finalScore)}</Text>
            </View>
            <Text variant="caption" className="pb-sm text-white/50">VS</Text>
            <View className="flex-1 items-end gap-sm">
              <Text className="text-right text-white/70" numberOfLines={1}>{awayName}</Text>
              <Text variant="statValue" className="text-white">{scoreFor(away?.finalScore)}</Text>
            </View>
          </View>
          {game.venue ? <Text variant="caption" className="text-white/60">{game.venue}</Text> : null}
          <View className="flex-row gap-sm">
            <StatChip label="Lines" value={stats.length} tone="glass" />
            <StatChip label="Media" value={media.length} tone="glass" />
            <StatChip label="Layers" value={tabs.length} tone="glass" />
          </View>
        </GlassPanel>
      </View>

      <ConnectedGameActionRail gameId={game.id} title={gameTitle} />

      <View className="flex-row gap-sm px-lg pb-sm">
        {game.status === 'SCHEDULED' || game.status === 'LIVE' ? (
          <Link href={{ pathname: '/games/[gameId]/live', params: { gameId: game.id } }} asChild>
            <Button size="sm" className="absolute left-lg z-20" style={{ bottom: GAME_DETAIL_LAYOUT.actionBottom }}>Enter Stats</Button>
          </Link>
        ) : null}
        <Link href={{ pathname: '/games/[gameId]/spectate', params: { gameId: game.id } }} asChild>
          <Button variant="secondary" size="sm" className="absolute right-lg z-20 bg-black/45 border-white/15" style={{ bottom: GAME_DETAIL_LAYOUT.actionBottom }}>
            Watch Live
          </Button>
        </Link>
      </View>

      <Sheet snaps={['half', 'expanded']}>
        <View className="flex-row items-center gap-sm px-lg pb-sm">
          <Radio size={18} color="#60A5FA" />
          <Text className="font-semibold">{homeName} vs {awayName}</Text>
        </View>
        <EntityProfileTabs tabs={tabs} active={tab} onChange={setTab} />
        <SheetScrollView contentContainerClassName="pb-xxl">
          <TabPanel active={tab} tab="Play by Play" animated={false}>
            <GamePlayByPlay sport={sport} events={events} playerNameById={playerNameById} teamNameById={teamNameById} className="px-lg gap-sm pt-sm" />
          </TabPanel>

          <TabPanel active={tab} tab="Box Score" animated={false}>
            <SportStatTable
              sport={sport}
              rows={stats}
              emptyTitle="No box score yet"
              emptyDescription="Stats appear once the game is finalized."
            />
          </TabPanel>

          <TabPanel active={tab} tab="Top Performers" className="px-lg gap-sm pt-sm" animated={false}>
              {topPerformers.length === 0 ? (
                <Text variant="caption">No finalized stats yet.</Text>
              ) : (
                topPerformers.map((line) => (
                  <Link key={line.id} href={{ pathname: '/players/[playerId]', params: { playerId: line.playerId } }} asChild>
                    <Pressable>
                      <GlassPanel className="bg-surface border-border p-md">
                        <View className="flex-row items-center gap-sm">
                          <BarChart3 size={18} color="#2563EB" />
                          <Text className="font-semibold">{line.playerName}</Text>
                        </View>
                        <Text variant="caption">{performerMeta(line)}</Text>
                      </GlassPanel>
                    </Pressable>
                  </Link>
                ))
              )}
          </TabPanel>

          <TabPanel active={tab} tab="Media" className="px-lg gap-md pt-sm" animated={false}>
              <MediaGrid items={mediaItems} onItemPress={mediaViewer.setViewerIndex} />
              <YouTubeMediaAttachForm targetType="GAME" targetId={game.id} />
          </TabPanel>

          <TabPanel active={tab} tab="Sources" className="pt-sm" animated={false}>
              <ConnectedSourcesPanel targetType="GAME" targetId={game.id} />
          </TabPanel>
        </SheetScrollView>
      </Sheet>
    </MediaSurface>
  )

  return (
    <>
    {showSidebar ? (
      <View className="flex-1 flex-row bg-canvas">
        <View className="flex-1">{main}</View>
        <WideSidebarColumn>
          <GameSidebar
            game={game}
            topPerformers={topPerformers}
            media={media}
            performerMeta={performerMeta}
          />
        </WideSidebarColumn>
      </View>
    ) : (
      main
    )}

    <ConnectedFullScreenMediaViewer {...mediaViewer.viewerProps} />
    </>
  )
}
