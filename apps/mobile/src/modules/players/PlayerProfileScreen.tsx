import { useEffect, useState } from 'react'
import { Pressable, Share, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import type { components } from '@statman/sdk'
import Animated, { FadeIn, Layout, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { ChevronDown } from 'lucide-react-native'
import { Text } from '@/shared/ui/Text'
import { LoadingState } from '@/shared/ui/LoadingState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { BackButton } from '@/shared/ui/BackButton'
import { ConnectedFullScreenMediaViewer } from '@/modules/media/ConnectedFullScreenMediaViewer'
import { toViewerItemsForTarget } from '@/modules/media/mediaViewerItem'
import { ConnectedImageUploadButton } from '@/modules/media/ConnectedImageUploadButton'
import { Screen } from '@/shared/layout'
import { useNativeColor, useSportTheme } from '@/lib/theme'
import { EntityProfileShell } from '@/shared/layout/entity-profile/EntityProfileShell'
import { MediaGrid } from '@/modules/media/MediaGrid'
import { YouTubeMediaAttachForm } from '@/modules/media/YouTubeMediaAttachForm'
import { ConnectedSourcesPanel } from '@/modules/disputes/ConnectedSourcesPanel'
import { PlayerSourceBadge } from '@/modules/players/PlayerSourceBadge'
import { PlayerHighlights } from '@/modules/players/PlayerHighlights'
import { usePlayerProfile } from '@/modules/players/usePlayerProfile'
import { ConnectedFollowButton } from '@/modules/social/ConnectedFollowButton'
import { ConnectedReactionBar } from '@/modules/social/ConnectedReactionBar'
import { SportStatStrip, SportStatTable } from '@/modules/sports'
import { cn } from '@/lib/utils'

type Player = components['schemas']['Player']
type AthleteProfile = components['schemas']['AthleteProfile']
const BASKETBALL_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const

function optionalBoundedNumber(value: string, min: number, max: number) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

function ProfileDetailsEditor({
  canEdit,
  player,
  profile,
  updatePlayer,
}: {
  canEdit: boolean
  player: Player
  profile: AthleteProfile
  updatePlayer: ReturnType<typeof usePlayerProfile>['updatePlayer']
}) {
  const [bio, setBio] = useState(profile.bio ?? '')
  const [hometown, setHometown] = useState(profile.hometown ?? '')
  const [position, setPosition] = useState(player.position ?? '')
  const [classYear, setClassYear] = useState(player.classYear ?? '')
  const [jerseyNumber, setJerseyNumber] = useState(player.jerseyNumber?.toString() ?? '')
  const [heightInches, setHeightInches] = useState(player.heightInches?.toString() ?? '')

  useEffect(() => {
    setBio(profile.bio ?? '')
    setHometown(profile.hometown ?? '')
    setPosition(player.position ?? '')
    setClassYear(player.classYear ?? '')
    setJerseyNumber(player.jerseyNumber?.toString() ?? '')
    setHeightInches(player.heightInches?.toString() ?? '')
  }, [player.classYear, player.heightInches, player.jerseyNumber, player.position, profile.bio, profile.hometown])

  if (!canEdit && !profile.bio) return null

  if (!canEdit) {
    return (
      <View className="px-lg pb-md">
        <Text>{profile.bio}</Text>
      </View>
    )
  }

  async function save() {
    await updatePlayer.mutateAsync({
      bio: bio || undefined,
      hometown: hometown || undefined,
      position: position || undefined,
      classYear: classYear || undefined,
      jerseyNumber: optionalBoundedNumber(jerseyNumber, 0, 99),
      heightInches: optionalBoundedNumber(heightInches, 40, 100),
    })
  }

  return (
    <View className="mx-lg mb-md gap-sm rounded-lg border border-border bg-surface p-md">
      <View>
        <Text className="font-semibold">Profile details</Text>
        <Text variant="caption">Quick edits update the public profile after you save.</Text>
      </View>
      <ConnectedImageUploadButton
        targetType="PLAYER"
        targetId={player.id}
        usage="AVATAR"
        label={profile.avatarUrl ? 'Replace Profile Image' : 'Upload Profile Image'}
        title="Public image"
        helperText="Tap to choose a profile image. Changes refresh the profile preview after upload."
        currentImageUri={profile.avatarUrl}
        mode="tile"
      />
      <Textarea placeholder="Bio" value={bio} onChangeText={setBio} />
      <Input placeholder="Hometown" value={hometown} onChangeText={setHometown} />
      <View className="gap-xs">
        <Text variant="caption">Position</Text>
        <View className="flex-row gap-sm">
          {BASKETBALL_POSITIONS.map((value) => {
            const selected = position === value
            return (
              <Pressable
                key={value}
                onPress={() => setPosition(value)}
                className={cn(
                  'flex-1 items-center rounded-md border px-sm py-sm active:opacity-70',
                  selected ? 'border-sport-accent bg-sport-accent' : 'border-border bg-canvas'
                )}
              >
                <Text className={cn('font-semibold', selected ? 'text-white' : 'text-text')}>{value}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
      <View className="flex-row gap-sm">
        <Input className="flex-1" placeholder="Class year" keyboardType="number-pad" value={classYear} onChangeText={setClassYear} />
        <Input className="flex-1" placeholder="Jersey" keyboardType="number-pad" value={jerseyNumber} onChangeText={setJerseyNumber} />
      </View>
      <View className="flex-row gap-sm">
        <Input className="flex-1" placeholder="Height inches" keyboardType="number-pad" value={heightInches} onChangeText={setHeightInches} />
      </View>
      <Button isLoading={updatePlayer.isPending} onPress={save}>Save Details</Button>
    </View>
  )
}

export function PlayerProfileScreen({ playerId }: { playerId: string }) {
  const profileState = usePlayerProfile(playerId)
  const router = useRouter()
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [statsExpanded, setStatsExpanded] = useState(false)
  const mutedTextColor = useNativeColor('mutedText')
  const sportTheme = useSportTheme(profileState.player?.sport?.slug)
  const chevronRotation = useSharedValue(0)
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevronRotation.value}deg` }] }))

  function toggleStatsExpanded() {
    setStatsExpanded((v) => !v)
    chevronRotation.value = withTiming(statsExpanded ? 0 : 180, { duration: 200 })
  }

  if (profileState.isError) {
    return (
      <Screen>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>
        <ErrorState className="flex-1 items-center justify-center p-lg gap-sm" message="This player couldn't be loaded." />
      </Screen>
    )
  }

  if (profileState.isLoading || !profileState.player || !profileState.profile) {
    return (
      <Screen>
        <View className="px-lg pb-md"><BackButton tone="dark" /></View>
        <LoadingState />
      </Screen>
    )
  }

  const { canEditProfile, games, lastGame, lastGameLine, media, player, profile, season, seasonHighPoints, setTab, stats, tab, tabs, updatePlayer } = profileState
  const sport = player.sport?.slug ?? 'basketball'
  const name = `${profile.firstName} ${profile.lastName}`
  const mediaItems = media.map((m) => ({ id: m.id, youtubeVideoId: m.youtubeVideoId, title: m.title }))
  const viewerItems = toViewerItemsForTarget(mediaItems, 'PLAYER', player.id)
  const classYear = player.classYear
    ? player.classYear.toLowerCase().startsWith('class') ? player.classYear : `Class of ${player.classYear}`
    : null
  const positionAndTeam = [player.position, classYear, player.currentTeam?.name].filter(Boolean).join(' · ')
  const currentTeam = player.currentTeam
  const teamMetaLine = positionAndTeam
    ? currentTeam
      ? { text: positionAndTeam, onPress: () => router.push({ pathname: '/teams/[teamId]', params: { teamId: currentTeam.id } }) }
      : positionAndTeam
    : null
  const heightLabel = player.heightInches ? `${Math.floor(player.heightInches / 12)}'${player.heightInches % 12}"` : null
  const vitals = [
    player.jerseyNumber != null ? { label: 'Jersey', value: `#${player.jerseyNumber}` } : null,
    heightLabel ? { label: 'Height', value: heightLabel } : null,
    player.classYear ? { label: 'Class', value: player.classYear.toLowerCase().startsWith('class') ? player.classYear.replace(/^class of\s*/i, '') : player.classYear } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  function handleShare() {
    const headline = stats.map((s) => `${s.value} ${s.label}`).join(' · ')
    Share.share({
      message: [name, [player.currentTeam?.name, player.position].filter(Boolean).join(' · '), headline]
        .filter(Boolean)
        .join('\n'),
    })
  }

  return (
    <>
      <EntityProfileShell
        style={sportTheme}
        hero={{ mediaItems, fallbackImageUri: profile.avatarUrl, onMediaPress: setViewerIndex }}
        onShare={handleShare}
        identity={{
          name,
          // Name → @username → location → position, per the profile's IA:
          // the athlete's identity dominates, everything else steps down.
          metaLines: [
            profile.claimedByUsername ? `@${profile.claimedByUsername}` : null,
            profile.hometown,
            teamMetaLine,
          ],
          avatarUri: profile.avatarUrl,
          badge: <PlayerSourceBadge status={profile.sourceStatus} />,
        }}
        stats={stats}
        highlights={<PlayerHighlights lastGameLine={lastGameLine} lastGame={lastGame} seasonHighPoints={seasonHighPoints} />}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      >
        <View className="flex-row items-center justify-between px-lg py-md">
          <ConnectedFollowButton targetType="PLAYER" targetId={player.id} />
          <ConnectedReactionBar targetType="PLAYER" targetId={player.id} />
        </View>

        {vitals.length > 0 ? (
          <View className="flex-row gap-sm px-lg pb-md">
            {vitals.map((item) => (
              <View key={item.label} className="flex-1 rounded-md border border-border bg-surface px-sm py-sm">
                <Text variant="caption">{item.label}</Text>
                <Text className="font-semibold">{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <ProfileDetailsEditor canEdit={canEditProfile} player={player} profile={profile} updatePlayer={updatePlayer} />

        {tab === 'Stats' ? (
          <Animated.View entering={FadeIn.duration(200)} layout={Layout.duration(220)} className="px-lg gap-sm">
            <Text className="font-semibold">Season totals</Text>
            {season ? (
              <>
                <SportStatStrip
                  sport={sport}
                  view={statsExpanded ? 'boxScore' : 'profileHeadline'}
                  source={season}
                  stats={season.stats as Record<string, unknown> | null}
                />
                <Pressable
                  onPress={toggleStatsExpanded}
                  className="flex-row items-center justify-center gap-xs py-sm"
                  hitSlop={8}
                >
                  <Text variant="caption">{statsExpanded ? 'Show less' : 'Show all stats'}</Text>
                  <Animated.View style={chevronStyle}>
                    <ChevronDown size={14} color={mutedTextColor} />
                  </Animated.View>
                </Pressable>
              </>
            ) : (
              <Text>No stats yet this season.</Text>
            )}
          </Animated.View>
        ) : null}

        {tab === 'Games' ? (
          <Animated.View entering={FadeIn.duration(200)}>
            <SportStatTable
              sport={sport}
              rows={games}
              mode="byGame"
              emptyTitle="No game stats yet"
              emptyDescription="Game stats appear after finalized contests."
            />
          </Animated.View>
        ) : null}

        {tab === 'Media' ? (
          <Animated.View entering={FadeIn.duration(200)} className="px-lg gap-md">
            <MediaGrid items={mediaItems} onItemPress={setViewerIndex} />
            <YouTubeMediaAttachForm targetType="PLAYER" targetId={player.id} />
          </Animated.View>
        ) : null}

        {tab === 'Sources' ? (
          <Animated.View entering={FadeIn.duration(200)} className="gap-lg">
            <View className="px-lg">
              <Text variant="caption">Source status: {profile.sourceStatus}</Text>
            </View>
            <ConnectedSourcesPanel targetType="ATHLETE_PROFILE" targetId={profile.id} />
          </Animated.View>
        ) : null}

        {!profile.claimedByUserId ? (
          <View className="mx-lg mt-lg gap-sm rounded-lg border border-border p-lg">
            <Text className="font-semibold">Is this you?</Text>
            <Text variant="caption">Claim this profile to manage it, attach media, and keep your stats up to date.</Text>
            <Link href={{ pathname: '/players/[playerId]/claim', params: { playerId: player.id } }} asChild>
              <Button variant="secondary" className="mt-xs">Claim this profile</Button>
            </Link>
          </View>
        ) : null}
      </EntityProfileShell>

      <ConnectedFullScreenMediaViewer
        visible={viewerIndex != null}
        items={viewerItems}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </>
  )
}
