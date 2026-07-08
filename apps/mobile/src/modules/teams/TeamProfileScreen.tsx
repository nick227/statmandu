import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'

import { Text } from '@/shared/ui/Text'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { ErrorScreenState, LoadingScreenState, TabPanel } from '@/shared/layout'
import { useSportTheme } from '@/lib/theme'
import { EntityProfileShell } from '@/shared/layout/entity-profile/EntityProfileShell'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { MediaGrid } from '@/modules/media/MediaGrid'
import { useTargetMediaViewer } from '@/modules/media/useTargetMediaViewer'
import { TeamRosterList } from '@/modules/teams/TeamRosterList'
import { TeamSidebar } from '@/modules/teams/TeamSidebar'
import { useTeamProfile } from '@/modules/teams/useTeamProfile'
import { YouTubeMediaAttachForm } from '@/modules/media/YouTubeMediaAttachForm'
import { ConnectedSourcesPanel } from '@/modules/disputes/ConnectedSourcesPanel'
import { ConnectedFollowButton } from '@/modules/social/ConnectedFollowButton'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'
import { SportStatStrip } from '@/modules/sports'

export function TeamProfileScreen({ teamId }: { teamId: string }) {
  const teamState = useTeamProfile(teamId)
  const sportTheme = useSportTheme(teamState.team?.sport?.slug)
  const mediaViewer = useTargetMediaViewer(teamState.media, 'TEAM', teamId)

  if (teamState.isError) {
    return <ErrorScreenState withBack message="This team couldn't be loaded." />
  }

  if (teamState.isLoading || !teamState.team) {
    return <LoadingScreenState withBack />
  }

  const { currentSeasonStats, games, roster, setTab, stats, tab, tabs, team } = teamState
  const sport = team.sport?.slug ?? 'basketball'
  const { mediaItems } = mediaViewer

  return (
    <>
    <EntityProfileShell
      style={sportTheme}
      hero={{ mediaItems, fallbackImageUri: team.logoUrl, onMediaPress: mediaViewer.setViewerIndex }}
      identity={{
        name: team.name,
        metaLines: [team.league?.name, team.city],
        avatarUri: team.logoUrl,
      }}
      stats={stats}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      sidebar={<TeamSidebar team={team} roster={roster} games={games} media={teamState.media} />}
    >
      <View className="flex-row items-center justify-between px-lg py-md">
        <ConnectedFollowButton targetType="TEAM" targetId={team.id} />
        <ConnectedReactionBar targetType="TEAM" targetId={team.id} />
      </View>

      <TabPanel active={tab} tab="Roster">
        <TeamRosterList memberships={roster} />
      </TabPanel>

      <TabPanel active={tab} tab="Games" className="px-lg gap-sm">
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
      </TabPanel>

      <TabPanel active={tab} tab="Stats" className="px-lg">
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
      </TabPanel>

      <TabPanel active={tab} tab="Media" className="px-lg gap-md">
          <MediaGrid items={mediaItems} onItemPress={mediaViewer.setViewerIndex} />
          <YouTubeMediaAttachForm targetType="TEAM" targetId={team.id} />
      </TabPanel>

      <TabPanel active={tab} tab="Sources">
        <ConnectedSourcesPanel targetType="TEAM" targetId={team.id} />
      </TabPanel>
    </EntityProfileShell>

    <ConnectedFullScreenMediaViewer {...mediaViewer.viewerProps} />
    </>
  )
}
