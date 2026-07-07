import { useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, Link } from 'expo-router'
import {
  usePlayer, usePlayerGames, usePlayerSeasonStats, useMedia,
} from '@statman/sdk'
import { Text } from '@/components/ui/Text'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { EntityProfileShell, SourceBadge } from '@/components/entity'
import { FollowButton, ReactionBar, BoxScoreTable, MediaAttachForm } from '@/components/domain'

const TABS = ['Stats', 'Games', 'Media', 'Sources']

// Player Profile — surface 3. Media-first hero + identity overlay + stat
// chips + sliding sheet, all from the shared EntityProfileShell.
export default function PlayerProfileScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>()
  const [tab, setTab] = useState(TABS[0])

  const { data: playerRes, isLoading } = usePlayer(playerId)
  const { data: seasonStatsRes } = usePlayerSeasonStats(playerId)
  const { data: gamesRes } = usePlayerGames(playerId)
  const { data: mediaRes } = useMedia('PLAYER', playerId ?? '')

  if (isLoading || !playerRes) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Spinner />
      </View>
    )
  }

  const player = playerRes.data
  const profile = player.athleteProfile
  const season = seasonStatsRes?.data[0]
  const primaryVideo = mediaRes?.data[0]

  return (
    <EntityProfileShell
      hero={{ youtubeVideoId: primaryVideo?.youtubeVideoId, fallbackImageUri: profile.avatarUrl }}
      identity={{
        name: `${profile.firstName} ${profile.lastName}`,
        subtitle: [player.currentTeam?.name, player.position, player.classYear].filter(Boolean).join(' · '),
        avatarUri: profile.avatarUrl,
        badge: <SourceBadge status={profile.sourceStatus} />,
      }}
      stats={[
        { label: 'PPG', value: season ? (season.points / Math.max(season.gamesPlayed, 1)).toFixed(1) : '0.0' },
        { label: 'RPG', value: season ? ((season.offRebounds + season.defRebounds) / Math.max(season.gamesPlayed, 1)).toFixed(1) : '0.0' },
        { label: 'APG', value: season ? (season.assists / Math.max(season.gamesPlayed, 1)).toFixed(1) : '0.0' },
        { label: 'GP', value: season?.gamesPlayed ?? 0 },
      ]}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      <View className="flex-row items-center justify-between px-lg py-md">
        <FollowButton targetType="PLAYER" targetId={player.id} />
        <ReactionBar targetType="PLAYER" targetId={player.id} />
      </View>

      {tab === 'Stats' ? (
        <View className="px-lg gap-sm">
          <Text className="font-semibold">Season totals</Text>
          <Text>{season ? `${season.points} PTS · ${season.assists} AST · ${season.offRebounds + season.defRebounds} REB` : 'No stats yet this season.'}</Text>
        </View>
      ) : null}

      {tab === 'Games' ? (
        <BoxScoreTable
          lines={gamesRes?.data ?? []}
          playerNameById={{ [player.id]: `${profile.firstName} ${profile.lastName}` }}
        />
      ) : null}

      {tab === 'Media' ? (
        <View className="px-lg gap-md">
          {(mediaRes?.data ?? []).length === 0 ? (
            <Text variant="caption">No media attached yet.</Text>
          ) : (
            mediaRes!.data.map((m) => <Text key={m.id}>{m.title ?? m.youtubeVideoId}</Text>)
          )}
          <MediaAttachForm targetType="PLAYER" targetId={player.id} />
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
