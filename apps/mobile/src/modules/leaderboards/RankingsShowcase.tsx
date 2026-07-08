import { Pressable, View } from 'react-native'
import { Link } from 'expo-router'
import { Award, ChevronRight, Trophy } from 'lucide-react-native'
import type { components } from '@statman/sdk'
import { formatStatValue, getSportDefinition } from '@statman/sports'
import { Text } from '@/shared/ui/Text'
import { useSportAccentColor } from '@/lib/theme'
import { GameSpotlightCardLink } from '@/modules/feed/SpotlightCardLinks'
import { AthleteSpotlightCardLink, TeamSpotlightCardLink } from '@/modules/leaderboards/SpotlightCardLinks'
import type { ShowcaseEntry, ShowcaseList } from '@/modules/leaderboards/showcaseTypes'

type PlayerLeaderboardEntry = components['schemas']['PlayerLeaderboardEntry']

function showcaseItemKey(item: ShowcaseEntry, kind: ShowcaseList['kind']) {
  if (kind === 'players') return (item as PlayerLeaderboardEntry).player.id
  if (kind === 'teams') return (item as components['schemas']['TeamLeaderboardEntry']).team.id
  return (item as components['schemas']['Game']).id
}

export function ChampionRibbon({
  sportSlug,
  stat,
  entry,
  statLabel,
  rankLabel,
}: {
  sportSlug: string
  stat: string
  entry: PlayerLeaderboardEntry
  statLabel?: string
  rankLabel?: string
}) {
  const accent = useSportAccentColor(sportSlug)
  const sport = getSportDefinition(sportSlug)
  const statField = sport.playerStatFields[stat]
  const value = formatStatValue(sport, stat, entry.value)
  const team = entry.player.currentTeam

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-surface">
      <View className="bg-black p-md">
        <View className="absolute inset-0 bg-sport-accent/20" />
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-sm">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Trophy size={16} color={accent} />
            </View>
            <View>
              <Text variant="caption" className="text-white/60">{statLabel ?? 'Current mark'}</Text>
              <Text className="text-lg font-bold text-white">{value} {statField?.label ?? stat}</Text>
            </View>
          </View>
          <Text variant="caption" className="text-white/60">{rankLabel ?? `Rank #${entry.rank}`}</Text>
        </View>
      </View>
      {team ? (
        <View className="flex-row gap-xs p-sm">
          <Link href={{ pathname: '/teams/[teamId]', params: { teamId: team.id } }} asChild>
            <Pressable className="flex-1 rounded-md border border-border px-sm py-xs active:opacity-70">
              <Text variant="caption" numberOfLines={1}>{team.name}</Text>
            </Pressable>
          </Link>
          <Link href={{ pathname: '/players/[playerId]', params: { playerId: entry.player.id } }} asChild>
            <Pressable className="flex-row items-center gap-xs rounded-md border border-border px-sm py-xs active:opacity-70">
              <Text variant="caption">Profile</Text>
              <ChevronRight size={14} color={accent} />
            </Pressable>
          </Link>
        </View>
      ) : null}
    </View>
  )
}

export function PodiumStrip({ entries, sportSlug }: { entries: PlayerLeaderboardEntry[]; sportSlug: string }) {
  const podium = [entries[1], entries[0], entries[2]].filter(Boolean) as PlayerLeaderboardEntry[]
  if (podium.length === 0) return null

  return (
    <View className="flex-row items-end gap-sm">
      {podium.map((entry) => {
        const isWinner = entry.rank === 1
        return (
          <View key={entry.player.id} className={isWinner ? 'flex-[1.15]' : 'flex-1'}>
            <AthleteSpotlightCardLink
              entry={entry}
              sportSlug={sportSlug}
              size="small"
              eyebrow={isWinner ? '#1' : `#${entry.rank}`}
            />
          </View>
        )
      })}
    </View>
  )
}

function ShowcaseItem({
  item,
  kind,
  sportSlug,
  featured,
}: {
  item: ShowcaseEntry
  kind: ShowcaseList['kind']
  sportSlug: string
  featured: boolean
}) {
  const className = featured ? undefined : 'flex-1'
  if (kind === 'players') {
    return (
      <AthleteSpotlightCardLink
        entry={item as PlayerLeaderboardEntry}
        sportSlug={sportSlug}
        size={featured ? 'large' : 'small'}
        className={className}
      />
    )
  }
  if (kind === 'teams') {
    return (
      <TeamSpotlightCardLink
        entry={item as components['schemas']['TeamLeaderboardEntry']}
        sportSlug={sportSlug}
        size={featured ? 'large' : 'small'}
        className={className}
      />
    )
  }
  return (
    <GameSpotlightCardLink
      game={item as components['schemas']['Game']}
      size={featured ? 'large' : 'small'}
      className={className}
    />
  )
}

export function ShowcaseMosaic({
  index,
  list,
  sportSlug,
}: {
  index: number
  list: ShowcaseList
  sportSlug: string
}) {
  const accent = useSportAccentColor(sportSlug)
  const entries = list.entries.slice(0, 3)
  if (entries.length === 0) return null
  const featuredFirst = index % 2 === 0
  const feature = featuredFirst ? entries[0] : entries[2] ?? entries[0]
  const compact = featuredFirst ? entries.slice(1, 3) : entries.slice(0, 2)

  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-sm">
      <View className="flex-row items-center gap-sm">
        <Award size={16} color={accent} />
        <View className="flex-1">
          <Text className="font-semibold">{list.title}</Text>
          <Text variant="caption" numberOfLines={2}>{list.subtitle}</Text>
        </View>
      </View>
      {featuredFirst ? (
        <>
          {feature ? <ShowcaseItem item={feature} kind={list.kind} sportSlug={sportSlug} featured /> : null}
          {compact.length > 0 ? (
            <View className="flex-row gap-sm">
              {compact.map((item) => <ShowcaseItem key={showcaseItemKey(item, list.kind)} item={item} kind={list.kind} sportSlug={sportSlug} featured={false} />)}
            </View>
          ) : null}
        </>
      ) : (
        <>
          {compact.length > 0 ? (
            <View className="flex-row gap-sm">
              {compact.map((item) => <ShowcaseItem key={showcaseItemKey(item, list.kind)} item={item} kind={list.kind} sportSlug={sportSlug} featured={false} />)}
            </View>
          ) : null}
          {feature ? <ShowcaseItem item={feature} kind={list.kind} sportSlug={sportSlug} featured /> : null}
        </>
      )}
    </View>
  )
}
