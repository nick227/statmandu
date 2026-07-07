import { View } from 'react-native'
import { Link } from 'expo-router'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { Button } from '@/shared/ui/Button'
import { EntityProfileShell } from '@/shared/layout/entity-profile/EntityProfileShell'
import { GameBoxScoreTable } from '@/modules/games/GameBoxScoreTable'
import { YouTubeMediaAttachForm } from '@/modules/media/YouTubeMediaAttachForm'
import { PlayerSourceBadge } from '@/modules/players/PlayerSourceBadge'
import { usePlayerProfile } from '@/modules/players/usePlayerProfile'
import { ConnectedFollowButton } from '@/modules/social/ConnectedFollowButton'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'

export function PlayerProfileScreen({ playerId }: { playerId: string }) {
  const profileState = usePlayerProfile(playerId)

  if (profileState.isLoading || !profileState.player || !profileState.profile) {
    return <LoadingState />
  }

  const { games, media, player, primaryVideo, profile, season, setTab, stats, tab, tabs } = profileState

  return (
    <EntityProfileShell
      hero={{ youtubeVideoId: primaryVideo?.youtubeVideoId, fallbackImageUri: profile.avatarUrl }}
      identity={{
        name: `${profile.firstName} ${profile.lastName}`,
        subtitle: [player.currentTeam?.name, player.position, player.classYear].filter(Boolean).join(' · '),
        avatarUri: profile.avatarUrl,
        badge: <PlayerSourceBadge status={profile.sourceStatus} />,
      }}
      stats={stats}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
    >
      <View className="flex-row items-center justify-between px-lg py-md">
        <ConnectedFollowButton targetType="PLAYER" targetId={player.id} />
        <ConnectedReactionBar targetType="PLAYER" targetId={player.id} />
      </View>

      {tab === 'Stats' ? (
        <View className="px-lg gap-sm">
          <Text className="font-semibold">Season totals</Text>
          <Text>{season ? `${season.points} PTS · ${season.assists} AST · ${season.offRebounds + season.defRebounds} REB` : 'No stats yet this season.'}</Text>
        </View>
      ) : null}

      {tab === 'Games' ? (
        <GameBoxScoreTable
          lines={games}
          playerNameById={{ [player.id]: `${profile.firstName} ${profile.lastName}` }}
        />
      ) : null}

      {tab === 'Media' ? (
        <View className="px-lg gap-md">
          {media.length === 0 ? (
            <Text variant="caption">No media attached yet.</Text>
          ) : (
            media.map((m) => <Text key={m.id}>{m.title ?? m.youtubeVideoId}</Text>)
          )}
          <YouTubeMediaAttachForm targetType="PLAYER" targetId={player.id} />
        </View>
      ) : null}

      {tab === 'Sources' ? (
        <View className="px-lg gap-sm">
          <Text variant="caption">Source status: {profile.sourceStatus}</Text>
        </View>
      ) : null}

      {!profile.claimedByUserId ? (
        <Link href={{ pathname: '/players/[playerId]/claim', params: { playerId: player.id } }} asChild>
          <Button variant="secondary" className="mx-lg mt-md">Claim this profile</Button>
        </Link>
      ) : null}
    </EntityProfileShell>
  )
}
