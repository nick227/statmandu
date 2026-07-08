import { View, Image, Linking, TouchableOpacity } from 'react-native'
import { Radio, Image as ImageIcon, PlaySquare } from 'lucide-react-native'
import { getSportDefinition } from '@statman/sports'
import type { components } from '@statman/sdk'
import { Text } from '@/shared/ui/Text'
import { Badge } from '@/shared/ui/Badge'
import { EmptyState } from '@/shared/ui/EmptyState'

type GameEvent = components['schemas']['GameEvent']
type ImageAsset = components['schemas']['ImageAsset']
type MediaAsset = components['schemas']['MediaAsset']

const DISPUTED_STATUSES = new Set(['CONFLICTING', 'DISPUTED'])

export interface GamePlayByPlayProps {
  sport: string
  events: GameEvent[]
  imageAssets?: ImageAsset[]
  mediaAssets?: MediaAsset[]
  playerNameById: Record<string, string>
  teamNameById: Record<string, string>
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

type TimelineItem = 
  | { kind: 'event'; id: string; timestamp: number; data: GameEvent; images: ImageAsset[]; media: MediaAsset[] }
  | { kind: 'standalone_image'; id: string; timestamp: number; data: ImageAsset }
  | { kind: 'standalone_media'; id: string; timestamp: number; data: MediaAsset }

// The game's story, told chronologically from real captured events — not a
// summary, the actual sequence a reporter (or corroborating reporters)
// entered live. Distinct from Box Score (aggregated totals) and Top
// Performers (derived highlights): this is play-by-play, one row per thing
// that happened. Disputed/conflicting events are shown, not hidden, flagged
// the same way the live spectator timeline already does.
export function GamePlayByPlay({
  sport,
  events,
  imageAssets = [],
  mediaAssets = [],
  playerNameById,
  teamNameById,
  emptyTitle = 'No plays recorded',
  emptyDescription = 'Play-by-play appears once events are captured for this game.',
  className,
}: GamePlayByPlayProps) {
  if (events.length === 0 && imageAssets.length === 0 && mediaAssets.length === 0) {
    return <EmptyState icon={Radio} title={emptyTitle} description={emptyDescription} />
  }

  const definition = getSportDefinition(sport)

  // Pre-calculate auto-moments (streaks / on-fire) based ONLY on events
  const momentsByEventId = new Map<string, { run?: string; fire?: boolean }>()
  let currentScoringTeam: string | null = null
  let teamRunCount = 0
  let currentScoringPlayer: string | null = null
  let playerRunCount = 0

  // Requires oldest-to-newest input to track momentum correctly. GameSnapshot's
  // recentEvents comes back newest-first, so live callers must reverse it first
  // (listGameEvents is already ascending, so GameDetailScreen passes it through as-is).
  for (const event of events) {
    const eventDefinition = definition.events[event.type]
    const isScoring = Boolean(eventDefinition?.points)

    if (isScoring && event.teamId) {
      if (event.teamId === currentScoringTeam) {
        teamRunCount++
      } else {
        currentScoringTeam = event.teamId
        teamRunCount = 1
      }

      if (event.playerId && event.playerId === currentScoringPlayer) {
        playerRunCount++
      } else if (event.playerId) {
        currentScoringPlayer = event.playerId
        playerRunCount = 1
      } else {
        currentScoringPlayer = null
        playerRunCount = 0
      }

      if (teamRunCount >= 3) {
        momentsByEventId.set(event.id, { run: `${teamRunCount} SCORE RUN` })
      }
      if (playerRunCount >= 3) {
        const existing = momentsByEventId.get(event.id) || {}
        momentsByEventId.set(event.id, { ...existing, fire: true })
      }
    }
  }

  // Build the unified timeline
  const timeline: TimelineItem[] = []
  
  const eventImages = new Map<string, ImageAsset[]>()
  const eventMedia = new Map<string, MediaAsset[]>()

  // Sort media into event-specific vs standalone
  imageAssets.forEach(img => {
    if (img.targetType === 'GAME_EVENT') {
      const arr = eventImages.get(img.targetId) ?? []
      arr.push(img)
      eventImages.set(img.targetId, arr)
    } else if (img.targetType === 'GAME') {
      timeline.push({ kind: 'standalone_image', id: img.id, timestamp: new Date(img.createdAt).getTime(), data: img })
    }
  })

  mediaAssets.forEach(media => {
    if (media.targetType === 'GAME_EVENT') {
      const arr = eventMedia.get(media.targetId) ?? []
      arr.push(media)
      eventMedia.set(media.targetId, arr)
    } else if (media.targetType === 'GAME') {
      timeline.push({ kind: 'standalone_media', id: media.id, timestamp: new Date(media.createdAt).getTime(), data: media })
    }
  })

  events.forEach(event => {
    timeline.push({
      kind: 'event',
      id: event.id,
      timestamp: new Date(event.clientTimestamp).getTime(),
      data: event,
      images: eventImages.get(event.id) ?? [],
      media: eventMedia.get(event.id) ?? []
    })
  })

  // Sort newest first
  timeline.sort((a, b) => b.timestamp - a.timestamp)

  return (
    <View className={className ?? 'px-lg gap-sm'}>
      {timeline.map((item) => {
        if (item.kind === 'standalone_image') {
          return (
            <View key={item.id} className="border-b border-border py-sm flex-row gap-sm items-start">
              <ImageIcon className="text-white/50" size={20} />
              <View className="flex-1">
                <Text className="font-semibold pb-xs">New Photo</Text>
                <Image source={{ uri: item.data.url }} className="w-full h-40 rounded-lg bg-gray-800" resizeMode="cover" />
              </View>
              <Text variant="caption">{new Date(item.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
            </View>
          )
        }

        if (item.kind === 'standalone_media') {
          return (
            <View key={item.id} className="border-b border-border py-sm flex-row gap-sm items-start">
              <PlaySquare className="text-white/50" size={20} />
              <View className="flex-1">
                <Text className="font-semibold pb-xs">{item.data.title || 'Highlight Video'}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(`https://youtube.com/watch?v=${item.data.youtubeVideoId}`)}>
                  <View className="w-full h-40 rounded-lg bg-gray-800 items-center justify-center border border-border">
                    <PlaySquare className="text-white" size={32} />
                  </View>
                </TouchableOpacity>
              </View>
              <Text variant="caption">{new Date(item.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
            </View>
          )
        }

        // Standard Event
        const event = item.data
        const eventDefinition = definition.events[event.type]
        const label = eventDefinition?.label ?? event.type.replace(/_/g, ' ')
        const playerName = event.playerId ? playerNameById[event.playerId] : null
        const teamName = event.teamId ? teamNameById[event.teamId] : null
        const isScoring = Boolean(eventDefinition?.points)
        const moment = momentsByEventId.get(event.id)
        
        const title = [playerName, label].filter(Boolean).join(' — ') || label

        return (
          <View key={event.id} className="flex-row items-start justify-between gap-sm border-b border-border py-sm">
            <View className="flex-1 gap-xs">
              <View className="flex-row items-center gap-xs">
                <Text className={isScoring ? 'font-semibold' : undefined} numberOfLines={2}>
                  {title}
                </Text>
                {moment?.fire ? <Text>🔥</Text> : null}
                {moment?.run ? <Badge tone="live">{moment.run}</Badge> : null}
              </View>
              {teamName ? <Text variant="caption">{teamName}</Text> : null}
              
              {/* Inline Attached Media */}
              {item.images.length > 0 || item.media.length > 0 ? (
                <View className="flex-row flex-wrap gap-xs pt-xs">
                  {item.images.map(img => (
                    <Image key={img.id} source={{ uri: img.url }} className="w-16 h-16 rounded bg-gray-800" resizeMode="cover" />
                  ))}
                  {item.media.map(med => (
                    <TouchableOpacity key={med.id} onPress={() => Linking.openURL(`https://youtube.com/watch?v=${med.youtubeVideoId}`)}>
                      <View className="w-16 h-16 rounded bg-gray-800 items-center justify-center border border-border">
                        <PlaySquare className="text-white/70" size={24} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            <View className="items-end gap-xs">
              <Text variant="caption">
                {new Date(item.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </Text>
              {DISPUTED_STATUSES.has(event.status) ? <Badge tone="dispute">Disputed</Badge> : null}
            </View>
          </View>
        )
      })}
    </View>
  )
}
