import { useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTeam, useTeamRoster, useGames } from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Spinner } from '@/components/ui/Spinner'
import { EntityProfileShell } from '@/components/entity'
import { FollowButton, ReactionBar, RosterList, GameStatusBadge } from '@/components/domain'

const TABS = ['Roster', 'Games', 'Stats']

// Team Profile — surface 4. Same shared shell as Player, different tabs.
export default function TeamProfileScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>()
  const [tab, setTab] = useState(TABS[0])

  const { data: teamRes, isLoading } = useTeam(teamId)
  const { data: rosterRes } = useTeamRoster(teamId)
  const { data: gamesRes } = useGames({ teamSlug: teamRes?.data.slug })

  if (isLoading || !teamRes) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Spinner />
      </View>
    )
  }

  const team = teamRes.data
  const roster = rosterRes?.data ?? []

  return (
    <EntityProfileShell
      hero={{ fallbackImageUri: team.logoUrl }}
      identity={{
        name: team.name,
        subtitle: [team.league?.name, team.city].filter(Boolean).join(' · '),
        avatarUri: team.logoUrl,
      }}
      stats={[
        { label: 'Roster', value: roster.length },
        { label: 'League', value: team.league?.name ?? '—' },
      ]}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      <View className="flex-row items-center justify-between px-lg py-md">
        <FollowButton targetType="TEAM" targetId={team.id} />
        <ReactionBar targetType="TEAM" targetId={team.id} />
      </View>

      {tab === 'Roster' ? <RosterList memberships={roster} /> : null}

      {tab === 'Games' ? (
        <View className="px-lg gap-sm">
          {(gamesRes?.data ?? []).map((g) => (
            <View key={g.id} className="flex-row items-center justify-between border-b border-border py-sm">
              <Text>{new Date(g.scheduledAt).toLocaleDateString()}</Text>
              <GameStatusBadge status={g.status} />
            </View>
          ))}
        </View>
      ) : null}

      {tab === 'Stats' ? (
        <View className="px-lg">
          <Text variant="caption">Team season stats aggregate — see docs/frontend-architecture.md parking lot.</Text>
        </View>
      ) : null}
    </EntityProfileShell>
  )
}
