import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Link, Stack } from 'expo-router'
import { BarChart3, Radio } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { Sheet, SheetScrollView } from '@/shared/ui/Sheet'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { toViewerItemsForTarget } from '@/modules/media/mediaViewerItem'
import { youtubeThumbnailUrl } from '@/shared/media/youtube'
import { EntityProfileTabs } from '@/shared/layout/entity-profile/EntityProfileTabs'
import { GlassPanel, MediaChrome, MediaSurface } from '@/shared/layout'
import { StatChip } from '@/shared/ui/StatChip'
import { useSportTheme } from '@/lib/theme'
import { useGameDetail } from '@/modules/games/useGameDetail'
import { ConnectedGameActionRail } from '@/modules/games/ConnectedGameActionRail'
import { GamePlayByPlay } from '@/modules/games/GamePlayByPlay'
import { MediaGrid } from '@/modules/media/MediaGrid'
import { YouTubeMediaAttachForm } from '@/modules/media/YouTubeMediaAttachForm'
import { ConnectedSourcesPanel } from '@/modules/disputes/ConnectedSourcesPanel'
import { getSportDefinition } from '@statman/sports'
import { SportStatTable, formattedSportStat, sportStatLabel } from '@/modules/sports'
import { GameStatusBadge } from './GameStatusBadge'

export function GameDetailScreen({ gameId }: { gameId: string }) {
  const gameState = useGameDetail(gameId)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const sportTheme = useSportTheme(gameState.game?.sport?.slug)

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
  const primaryMedia = media[0]
  const heroImageUri = primaryMedia?.youtubeVideoId ? youtubeThumbnailUrl(primaryMedia.youtubeVideoId) : null
  const mediaItems = media.map((m) => ({ id: m.id, youtubeVideoId: m.youtubeVideoId, title: m.title }))
  const viewerItems = toViewerItemsForTarget(mediaItems, 'GAME', game.id)
  const scoreFor = (score?: number | null) => score ?? 0
  const scheduled = new Date(game.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const gameTitle = `${homeName} vs ${awayName}`

  return (
    <>
    <MediaSurface imageUri={heroImageUri} style={sportTheme}>
      <Stack.Screen options={{ headerShown: false, title: gameTitle }} />
      <MediaChrome title={game.sport?.name ?? 'Game'} />

      <View className="absolute inset-x-0 bottom-[42%] z-10 px-lg">
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
            <Button size="sm" className="absolute bottom-[34%] left-lg z-20">Enter Stats</Button>
          </Link>
        ) : null}
        <Link href={{ pathname: '/games/[gameId]/spectate', params: { gameId: game.id } }} asChild>
          <Button variant="secondary" size="sm" className="absolute bottom-[34%] right-lg z-20 bg-black/45 border-white/15">
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
          {tab === 'Play by Play' ? (
            <GamePlayByPlay sport={sport} events={events} playerNameById={playerNameById} teamNameById={teamNameById} className="px-lg gap-sm pt-sm" />
          ) : null}

          {tab === 'Box Score' ? (
            <SportStatTable
              sport={sport}
              rows={stats}
              emptyTitle="No box score yet"
              emptyDescription="Stats appear once the game is finalized."
            />
          ) : null}

          {tab === 'Top Performers' ? (
            <View className="px-lg gap-sm pt-sm">
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
                        <Text variant="caption">
                          {leaderboardStats.map((key) => `${formattedSportStat(sport, line, key)} ${sportStatLabel(sport, key)}`).join(' · ')}
                        </Text>
                      </GlassPanel>
                    </Pressable>
                  </Link>
                ))
              )}
            </View>
          ) : null}

          {tab === 'Media' ? (
            <View className="px-lg gap-md pt-sm">
              <MediaGrid items={mediaItems} onItemPress={setViewerIndex} />
              <YouTubeMediaAttachForm targetType="GAME" targetId={game.id} />
            </View>
          ) : null}

          {tab === 'Sources' ? (
            <View className="pt-sm">
              <ConnectedSourcesPanel targetType="GAME" targetId={game.id} />
            </View>
          ) : null}
        </SheetScrollView>
      </Sheet>
    </MediaSurface>

    <ConnectedFullScreenMediaViewer
      visible={viewerIndex != null}
      items={viewerItems}
      initialIndex={viewerIndex ?? 0}
      onClose={() => setViewerIndex(null)}
    />
    </>
  )
}
