import { View } from 'react-native'

import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { EntityProfileShell } from '@/shared/layout/entity-profile/EntityProfileShell'
import { GameStatusBadge } from '@/modules/games/GameStatusBadge'
import { TeamRosterList } from '@/modules/teams/TeamRosterList'
import { useTeamProfile } from '@/modules/teams/useTeamProfile'
import { ConnectedFollowButton } from '@/modules/social/ConnectedFollowButton'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'

export function TeamProfileScreen({ teamId }: { teamId: string }) {
  const teamState = useTeamProfile(teamId)

  if (teamState.isLoading || !teamState.team) {
    return <LoadingState />
  }

  const { games, roster, setTab, stats, tab, tabs, team } = teamState

  return (
    <EntityProfileShell
      hero={{ fallbackImageUri: team.logoUrl }}
      identity={{
        name: team.name,
        subtitle: [team.league?.name, team.city].filter(Boolean).join(' · '),
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
          {games.map((g) => (
            <View key={g.id} className="flex-row items-center justify-between border-b border-border py-sm">
              <Text>{new Date(g.scheduledAt).toLocaleDateString()}</Text>
              <GameStatusBadge status={g.status} />
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'Stats' ? (
        <View className="px-lg">
          <Text variant="caption">Team season stats are not available yet.</Text>
        </View>
      ) : null}
    </EntityProfileShell>
  )
}
