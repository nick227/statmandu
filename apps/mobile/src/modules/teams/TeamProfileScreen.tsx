import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'

import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { BackButton } from '@/shared/ui/BackButton'
import { FullScreenMediaViewer } from '@/shared/media'
import { Screen } from '@/shared/layout'
import { useSportTheme } from '@/lib/theme'
import { EntityProfileShell } from '@/shared/layout/entity-profile/EntityProfileShell'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { MediaGrid } from '@/modules/media/MediaGrid'
import { TeamRosterList } from '@/modules/teams/TeamRosterList'
import { useTeamProfile } from '@/modules/teams/useTeamProfile'
import { YouTubeMediaAttachForm } from '@/modules/media/YouTubeMediaAttachForm'
import { ConnectedSourcesPanel } from '@/modules/disputes/ConnectedSourcesPanel'
import { ConnectedFollowButton } from '@/modules/social/ConnectedFollowButton'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'
import { SportStatStrip } from '@/modules/sports'

export function TeamProfileScreen({ teamId }: { teamId: string }) {
  const teamState = useTeamProfile(teamId)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const sportTheme = useSportTheme(teamState.team?.sport?.slug)

  if (teamState.isError) {
    return (
      <Screen>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>
        <ErrorState className="flex-1 items-center justify-center p-lg gap-sm" message="This team couldn't be loaded." />
      </Screen>
    )
  }

  if (teamState.isLoading || !teamState.team) {
    return (
      <Screen>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>
        <LoadingState />
      </Screen>
    )
  }

  const { currentSeasonStats, games, media, roster, setTab, stats, tab, tabs, team } = teamState
  const sport = team.sport?.slug ?? 'basketball'
  const mediaItems = media.map((m) => ({ id: m.id, youtubeVideoId: m.youtubeVideoId, title: m.title }))

  return (
    <>
    <EntityProfileShell
      style={sportTheme}
      hero={{ mediaItems, fallbackImageUri: team.logoUrl, onMediaPress: setViewerIndex }}
      identity={{
        name: team.name,
        metaLines: [team.league?.name, team.city],
        avatarUri: team.logoUrl,
      }}
      stats={stats}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
    >
      <View className="flex-row items-center justify-between px-lg py-md">
        <ConnectedFollowButton targetType="TEAM" targetId={team.id} />
        <ConnectedReactionBar targetType="TEAM" targetId={team.id} />
      </View>

      {tab === 'Roster' ? <TeamRosterList memberships={roster} /> : null}

      {tab === 'Games' ? (
        <View className="px-lg gap-sm">
          {games.map((g) => {
            const opponent = g.gameTeams.find((gt) => gt.teamId !== team.id)?.team?.name
            return (
              <Link key={g.id} href={{ pathname: '/games/[gameId]', params: { gameId: g.id } }} asChild>
                <Pressable className="flex-row items-center justify-between border-b border-border py-sm active:opacity-70">
                  <View>
                    <Text numberOfLines={1}>{opponent ? `vs ${opponent}` : 'Game'}</Text>
                    <Text variant="caption">{new Date(g.scheduledAt).toLocaleDateString()}</Text>
                  </View>
                  <GameStatusBadge status={g.status} />
                </Pressable>
              </Link>
            )
          })}
        </View>
      ) : null}

      {tab === 'Stats' ? (
        <View className="px-lg">
          {currentSeasonStats ? (
            <SportStatStrip
              sport={sport}
              view="teamProfileHeadline"
              source={currentSeasonStats}
              stats={currentSeasonStats.stats as Record<string, unknown> | null}
            />
          ) : (
            <Text variant="caption">No team stats yet this season.</Text>
          )}
        </View>
      ) : null}

      {tab === 'Media' ? (
        <View className="px-lg gap-md">
          <MediaGrid items={mediaItems} onItemPress={setViewerIndex} />
          <YouTubeMediaAttachForm targetType="TEAM" targetId={team.id} />
        </View>
      ) : null}

      {tab === 'Sources' ? <ConnectedSourcesPanel targetType="TEAM" targetId={team.id} /> : null}
    </EntityProfileShell>

    <FullScreenMediaViewer
      visible={viewerIndex != null}
      items={mediaItems}
      initialIndex={viewerIndex ?? 0}
      onClose={() => setViewerIndex(null)}
    />
    </>
  )
}
